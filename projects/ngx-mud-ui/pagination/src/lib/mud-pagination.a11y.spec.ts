import axe from 'axe-core';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPagination } from './mud-pagination.component';
import type { MudPaginationSize } from './mud-pagination.types';

@Component({
  imports: [MudPagination],
  template: `
    <main>
      <mud-pagination [length]="200" [pageIndex]="pageIndex()" [disabled]="disabled()" [size]="size()" aria-label="Rezultate" />
    </main>
  `,
})
class Host {
  readonly pageIndex = signal(0);
  readonly disabled = signal(false);
  readonly size = signal<MudPaginationSize>('medium');
}

// jsdom has no canvas and no stylesheet is loaded; contrast is covered by pagination.contrast.spec.ts.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
  },
};

async function violations(target: Element | Element[]): Promise<string[]> {
  const results = await axe.run(target, AXE_OPTIONS);

  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`);
}

async function render(setup: (host: Host) => void) {
  const fixture = TestBed.createComponent(Host);

  setup(fixture.componentInstance);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();

  return fixture;
}

describe('MudPagination accessibility', () => {
  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
    document.body.replaceChildren();
  });

  it.each([0, 9, 19])('has no axe violations on page index %i', async (pageIndex) => {
    const fixture = await render((h) => h.pageIndex.set(pageIndex));

    expect(await violations(fixture.nativeElement)).toEqual([]);
  });

  it('has no axe violations when disabled and small', async () => {
    const fixture = await render((h) => {
      h.disabled.set(true);
      h.size.set('small');
    });

    expect(await violations(fixture.nativeElement)).toEqual([]);
  });

  it('has no axe violations with an overflow menu open', async () => {
    const fixture = await render((h) => h.pageIndex.set(9));

    (fixture.nativeElement.querySelector('.mud-pagination__overflow') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-container .menu')).not.toBeNull();

    // The menu panel lives in a CDK overlay outside the fixture, so it needs its
    // own scan target — but scanning document.body wholesale trips axe's
    // 'region' rule ("all page content must sit in a landmark") purely because
    // CDK's own .cdk-overlay-container div is a body-level sibling of
    // everything else on the page, not because of anything this component
    // renders (same false positive documented in
    // mud-breadcrumb.a11y.spec.ts). Scanning the fixture and the overlay
    // container as two explicit contexts covers the same surface (trigger
    // button + panel content) without that false positive, keeping every
    // other rule — including the ones that matter — fully enabled.
    const overlayContainer = document.querySelector('.cdk-overlay-container');

    // Fail loudly if the panel never opened, rather than silently scanning
    // one context instead of two.
    expect(overlayContainer).not.toBeNull();

    expect(await violations([fixture.nativeElement as HTMLElement, overlayContainer!])).toEqual([]);
  });

  it('exposes one navigation landmark with list semantics', async () => {
    const fixture = await render((h) => h.pageIndex.set(9));
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('nav').length).toBe(1);
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Rezultate');
    expect(root.querySelector('ul')!.getAttribute('role')).toBe('list');
    expect(root.querySelectorAll('[aria-current="page"]').length).toBe(1);
  });
});
