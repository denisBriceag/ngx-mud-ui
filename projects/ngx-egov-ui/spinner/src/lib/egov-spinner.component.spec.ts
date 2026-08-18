import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EgovSpinner } from './egov-spinner.component';
import type { EgovSpinnerSize, EgovSpinnerVariant } from './egov-spinner.component';

@Component({
  imports: [EgovSpinner],
  template: `<egov-spinner [size]="size()" [variant]="variant()" />`,
})
class Host {
  readonly size = signal<EgovSpinnerSize>('medium');
  readonly variant = signal<EgovSpinnerVariant>('brand');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('egov-spinner') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('EgovSpinner', () => {
  it('renders a medium brand spinner with status semantics by default', async () => {
    const { el } = await render();

    expect(el.classList.contains('spinner')).toBe(true);
    expect(el.classList.contains('spinner--medium')).toBe(true);
    expect(el.classList.contains('spinner--brand')).toBe(true);
    expect(el.getAttribute('role')).toBe('status');
  });

  it('exposes the label as visually-hidden text, not an aria-label attribute', async () => {
    const { el } = await render();
    const label = el.querySelector('.egov-spinner-label') as HTMLElement | null;

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
      imports: [EgovSpinner],
      template: `<egov-spinner aria-label="Se încarcă" />`,
    })
    class LocalizedHost {}

    const fixture = TestBed.createComponent(LocalizedHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('egov-spinner') as HTMLElement;

    expect(el.querySelector('.egov-spinner-label')?.textContent).toBe('Se încarcă');
    expect(el.getAttribute('aria-label')).toBeNull();
    expect(el.getAttribute('role')).toBe('status');
  });
});
