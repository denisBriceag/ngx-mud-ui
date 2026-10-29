import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudLink } from '../mud-link.directive';
import type { MudLinkSize, MudLinkStyle, MudLinkTouchTarget, MudLinkUnderline } from '../mud-link.directive';

@Component({
  imports: [MudLink],
  template: `
    <a
      href="#"
      [mudLink]="style()"
      [size]="size()"
      [underline]="underline()"
      [touchTarget]="touchTarget()"
      [disabled]="disabled()"
      (click)="clicks = clicks + 1"
    >
      Services
    </a>
  `,
})
class Host {
  readonly style = signal<MudLinkStyle | ''>('');
  readonly size = signal<MudLinkSize>('md');
  readonly underline = signal<MudLinkUnderline>('always');
  readonly touchTarget = signal<MudLinkTouchTarget>('auto');
  readonly disabled = signal(false);
  clicks = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudLink', () => {
  it('renders a primary medium underlined link by default', async () => {
    const { el } = await render();

    expect(el.classList.contains('link')).toBe(true);
    expect(el.classList.contains('link-primary')).toBe(true);
    expect(el.classList.contains('link-md')).toBe(true);
    expect(el.classList.contains('link-underline')).toBe(true);
  });

  it('maps the strict style', async () => {
    const { fixture, host, el } = await render();

    host.style.set('strict');
    await fixture.whenStable();
    expect(el.classList.contains('link-strict')).toBe(true);
    expect(el.classList.contains('link-primary')).toBe(false);
  });

  it('maps all four sizes to the design-system classes', async () => {
    const { fixture, host, el } = await render();

    const expected: [MudLinkSize, string][] = [
      ['lg', 'link-lg'],
      ['md', 'link-md'],
      ['sm', 'link-sm'],
      ['xs', 'link-xs'],
    ];

    for (const [size, cls] of expected) {
      host.size.set(size);
      await fixture.whenStable();
      expect(el.classList.contains(cls)).toBe(true);
    }
  });

  it('maps the three underline modes to their classes', async () => {
    const { fixture, host, el } = await render();

    expect(el.classList.contains('link-underline')).toBe(true);

    host.underline.set('hover');
    await fixture.whenStable();
    expect(el.classList.contains('link-underline-hover')).toBe(true);
    expect(el.classList.contains('link-underline')).toBe(false);

    host.underline.set('none');
    await fixture.whenStable();
    expect(el.classList.contains('link-no-underline')).toBe(true);
    expect(el.classList.contains('link-underline-hover')).toBe(false);
  });

  it('marks links as external by default and honors external=false', async () => {
    const { fixture, el } = await render();

    expect(el.classList.contains('link-external')).toBe(true);

    const external = TestBed.createComponent(NotExternalHost);

    await external.whenStable();
    const a = external.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(a.classList.contains('link-external')).toBe(false);
    expect(fixture).toBeDefined();
  });

  it('adds rel="noopener noreferrer" to target=_blank anchors without rel', async () => {
    const fixture = TestBed.createComponent(BlankTargetHost);

    await fixture.whenStable();
    const anchors = fixture.nativeElement.querySelectorAll('a');

    expect(anchors[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(anchors[1].getAttribute('rel')).toBe('me');
  });

  it('applies the 32px pointer target by default on fine-pointer devices', async () => {
    const { el } = await render();

    expect(el.classList.contains('link-target-pointer')).toBe(true);
    expect(el.classList.contains('link-target-touch')).toBe(false);
  });

  it('applies the 40px touch target automatically on coarse-pointer devices', async () => {
    // jsdom has no matchMedia; provide one reporting a coarse pointer.
    const matchMediaMock = vi.fn().mockReturnValue({ matches: true } as MediaQueryList);

    vi.stubGlobal('matchMedia', matchMediaMock);

    try {
      const { el } = await render();

      expect(matchMediaMock).toHaveBeenCalledWith('(pointer: coarse)');
      expect(el.classList.contains('link-target-touch')).toBe(true);
      expect(el.classList.contains('link-target-pointer')).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('honors explicit touchTarget overrides including opting out', async () => {
    const { fixture, host, el } = await render();

    host.touchTarget.set('touch');
    await fixture.whenStable();
    expect(el.classList.contains('link-target-touch')).toBe(true);

    host.touchTarget.set('pointer');
    await fixture.whenStable();
    expect(el.classList.contains('link-target-pointer')).toBe(true);

    host.touchTarget.set('none');
    await fixture.whenStable();
    expect(el.classList.contains('link-target-pointer')).toBe(false);
    expect(el.classList.contains('link-target-touch')).toBe(false);
  });

  it('disables via aria-disabled, leaves the tab order, and blocks clicks', async () => {
    const { fixture, host, el } = await render();

    host.disabled.set(true);
    await fixture.whenStable();
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.getAttribute('tabindex')).toBe('-1');

    el.click();
    expect(host.clicks).toBe(0);

    host.disabled.set(false);
    await fixture.whenStable();
    expect(el.getAttribute('aria-disabled')).toBeNull();
    expect(el.getAttribute('tabindex')).toBeNull();

    el.click();
    expect(host.clicks).toBe(1);
  });

  it('brings the link CSS with it', async () => {
    await render();

    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.link\s*\{/);
  });
});

@Component({
  imports: [MudLink],
  template: `<a href="#" mudLink [external]="false">Internal</a>`,
})
class NotExternalHost {}

@Component({
  imports: [MudLink],
  template: `
    <a href="https://gov.md" mudLink target="_blank">Portal</a>
    <a href="https://gov.md" mudLink target="_blank" rel="me">Profile</a>
  `,
})
class BlankTargetHost {}
