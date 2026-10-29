import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudButton } from '../mud-button.directive';
import type { MudButtonColor, MudButtonShape, MudButtonSize, MudButtonVariant } from '../mud-button.directive';
import { MudIconButton } from '../mud-icon-button.directive';

@Component({
  imports: [MudButton],
  template: `
    <button
      [mudButton]="variant()"
      [color]="color()"
      [size]="size()"
      [shape]="shape()"
      [fullWidth]="fullWidth()"
      [disabled]="disabled()"
      [loading]="loading()"
      (click)="clicks = clicks + 1"
    >
      Save
    </button>
  `,
})
class ButtonHost {
  readonly variant = signal<MudButtonVariant | ''>('');
  readonly color = signal<MudButtonColor>('primary');
  readonly size = signal<MudButtonSize>('lg');
  readonly shape = signal<MudButtonShape>('rectangular');
  readonly fullWidth = signal(false);
  readonly disabled = signal(false);
  readonly loading = signal(false);
  clicks = 0;
}

@Component({
  imports: [MudButton],
  template: `<a mudButton href="#" [disabled]="disabled()" (click)="clicks = clicks + 1">Back</a>`,
})
class AnchorHost {
  readonly disabled = signal(false);
  clicks = 0;
}

@Component({
  imports: [MudIconButton],
  template: `
    <button mudIconButton aria-label="Add" [size]="size()" [disabled]="disabled()" [loading]="loading()" (click)="clicks = clicks + 1">
      <svg></svg>
    </button>
  `,
})
class IconButtonHost {
  readonly size = signal<'md' | 'sm'>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  clicks = 0;
}

@Component({
  imports: [MudIconButton],
  template: `<button mudIconButton><svg></svg></button>`,
})
class UnlabeledIconButtonHost {}

async function render<T>(hostType: new () => T, selector: string) {
  const fixture = TestBed.createComponent(hostType);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector(selector) as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudButton', () => {
  it('renders a filled primary large rectangular button by default', async () => {
    const { el } = await render(ButtonHost, 'button');

    expect(el.classList.contains('mud-btn')).toBe(true);
    expect(el.classList.contains('mud-btn-primary')).toBe(true);
    expect(el.classList.contains('mud-btn-md')).toBe(false);
    expect(el.classList.contains('mud-btn-sm')).toBe(false);
    expect(el.classList.contains('mud-btn-rounded')).toBe(false);
  });

  it('maps variant and color to the design-system classes', async () => {
    const { fixture, host, el } = await render(ButtonHost, 'button');

    host.variant.set('outlined');
    host.color.set('destructive');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-outline-destructive')).toBe(true);
    expect(el.classList.contains('mud-btn-primary')).toBe(false);

    host.variant.set('text');
    host.color.set('strict');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-text-strict')).toBe(true);
    expect(el.classList.contains('mud-btn-outline-destructive')).toBe(false);

    host.variant.set('filled');
    host.color.set('neutral');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-neutral')).toBe(true);
  });

  it('maps sizes to mud-btn-md / mud-btn-sm with large as the unsuffixed default', async () => {
    const { fixture, host, el } = await render(ButtonHost, 'button');

    host.size.set('md');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-md')).toBe(true);

    host.size.set('sm');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-sm')).toBe(true);
    expect(el.classList.contains('mud-btn-md')).toBe(false);

    host.size.set('lg');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-sm')).toBe(false);
  });

  it('applies mud-btn-rounded for the circular shape', async () => {
    const { fixture, host, el } = await render(ButtonHost, 'button');

    host.shape.set('circular');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-rounded')).toBe(true);

    host.shape.set('rectangular');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-rounded')).toBe(false);
  });

  it('applies mud-btn-full when fullWidth is set', async () => {
    const { fixture, host, el } = await render(ButtonHost, 'button');

    expect(el.classList.contains('mud-btn-full')).toBe(false);

    host.fullWidth.set(true);
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-full')).toBe(true);
  });

  it('falls back to primary and warns in dev mode for unsupported variant/color combos', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, host, el } = await render(ButtonHost, 'button');

    host.variant.set('outlined');
    host.color.set('secondary');
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-outline-primary')).toBe(true);
    expect(el.classList.contains('mud-btn-outline-secondary')).toBe(false);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('disables the native button via the disabled attribute', async () => {
    const { fixture, host, el } = await render(ButtonHost, 'button');

    host.disabled.set(true);
    await fixture.whenStable();
    expect((el as HTMLButtonElement).disabled).toBe(true);

    el.click();
    expect(host.clicks).toBe(0);
  });

  it('keeps the button focusable while loading but blocks activation and exposes busy state', async () => {
    const { fixture, host, el } = await render(ButtonHost, 'button');

    host.loading.set(true);
    await fixture.whenStable();

    expect(el.classList.contains('mud-btn-loading')).toBe(true);
    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect((el as HTMLButtonElement).disabled).toBe(false);

    el.click();
    expect(host.clicks).toBe(0);

    host.loading.set(false);
    await fixture.whenStable();
    expect(el.getAttribute('aria-busy')).toBeNull();
    expect(el.getAttribute('aria-disabled')).toBeNull();

    el.click();
    expect(host.clicks).toBe(1);
  });

  it('disables anchors via aria-disabled, removes them from the tab order, and blocks clicks', async () => {
    const { fixture, host, el } = await render(AnchorHost, 'a');

    expect(el.classList.contains('mud-btn')).toBe(true);

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
});

describe('MudIconButton', () => {
  it('applies the icon button classes', async () => {
    const { el } = await render(IconButtonHost, 'button');

    expect(el.classList.contains('mud-btn')).toBe(true);
    expect(el.classList.contains('mud-btn-icon')).toBe(true);
  });

  it('adds the sm size class only for size="sm"', async () => {
    const { fixture, host, el } = await render(IconButtonHost, 'button');

    expect(el.classList.contains('mud-btn-sm')).toBe(false);

    host.size.set('sm');
    await fixture.whenStable();

    expect(el.classList.contains('mud-btn-sm')).toBe(true);
    expect(el.classList.contains('mud-btn-icon')).toBe(true);
  });

  it('supports disabled and loading like a regular button', async () => {
    const { fixture, host, el } = await render(IconButtonHost, 'button');

    host.loading.set(true);
    await fixture.whenStable();
    expect(el.classList.contains('mud-btn-loading')).toBe(true);
    expect(el.getAttribute('aria-busy')).toBe('true');

    el.click();
    expect(host.clicks).toBe(0);

    host.loading.set(false);
    host.disabled.set(true);
    await fixture.whenStable();
    expect((el as HTMLButtonElement).disabled).toBe(true);
  });

  it('warns in dev mode when the icon button has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await render(UnlabeledIconButtonHost, 'button');
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('does not warn when an aria-label is provided', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await render(IconButtonHost, 'button');
    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });
});
