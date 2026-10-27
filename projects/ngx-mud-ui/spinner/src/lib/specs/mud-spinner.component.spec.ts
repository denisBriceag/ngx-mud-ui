import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudSpinner } from '../mud-spinner.component';
import type { MudSpinnerSize, MudSpinnerVariant } from '../mud-spinner.component';

@Component({
  imports: [MudSpinner],
  template: `<mud-spinner [size]="size()" [variant]="variant()" />`,
})
class Host {
  readonly size = signal<MudSpinnerSize>('medium');
  readonly variant = signal<MudSpinnerVariant>('brand');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-spinner') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudSpinner', () => {
  it('renders a medium brand spinner with status semantics by default', async () => {
    const { el } = await render();

    expect(el.classList.contains('spinner')).toBe(true);
    expect(el.classList.contains('spinner--medium')).toBe(true);
    expect(el.classList.contains('spinner--brand')).toBe(true);
    expect(el.getAttribute('role')).toBe('status');
  });

  it('exposes the label as visually-hidden text, not an aria-label attribute', async () => {
    const { el } = await render();
    const label = el.querySelector('.mud-spinner-label') as HTMLElement | null;

    expect(label).not.toBeNull();
    expect(label!.textContent).toBe('Loading');
    // Live regions announce text-content changes; an attribute-only name is
    // unreliable on mount, so the host must NOT carry aria-label.
    expect(el.getAttribute('aria-label')).toBeNull();
  });

  it('maps all four sizes to the design-system classes', async () => {
    const { fixture, host, el } = await render();

    for (const size of ['extra-small', 'small', 'medium', 'large'] as const) {
      host.size.set(size);
      await fixture.whenStable();
      expect(el.classList.contains(`spinner--${size}`)).toBe(true);
    }
  });

  it('maps all four variants to the design-system classes', async () => {
    const { fixture, host, el } = await render();

    for (const variant of ['brand', 'dark', 'light', 'light-on-color'] as const) {
      host.variant.set(variant);
      await fixture.whenStable();
      expect(el.classList.contains(`spinner--${variant}`)).toBe(true);
    }
  });

  it('accepts a localized aria-label override', async () => {
    @Component({
      imports: [MudSpinner],
      template: `<mud-spinner aria-label="Se încarcă" />`,
    })
    class LocalizedHost {}

    const fixture = TestBed.createComponent(LocalizedHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-spinner') as HTMLElement;

    expect(el.querySelector('.mud-spinner-label')?.textContent).toBe('Se încarcă');
    expect(el.getAttribute('aria-label')).toBeNull();
    expect(el.getAttribute('role')).toBe('status');
  });

  it('takes the default label from the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { el } = await render();

    expect(el.querySelector('.mud-spinner-label')?.textContent).toBe(MUD_LABELS_RO.spinner!.loading);
  });
});

describe('MudSpinner styles', () => {
  // The component brings its own CSS — there is no global stylesheet in jsdom.
  it('ships its own CSS', () => {
    @Component({ imports: [MudSpinner], template: `<mud-spinner />` })
    class StylesHost {}

    TestBed.createComponent(StylesHost).detectChanges();
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.spinner\s*\{/);
  });
});
