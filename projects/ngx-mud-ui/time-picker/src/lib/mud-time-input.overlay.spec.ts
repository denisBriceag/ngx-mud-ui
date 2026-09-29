import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTimeInput } from './mud-time-input.component';
import { MudLabel } from '../../../label/src/public-api';

@Component({
  imports: [MudTimeInput, MudLabel],
  template: `
    <mud-time-input
      [(value)]="value"
      [(open)]="open"
      [min]="min()"
      [minuteStep]="minuteStep()"
      [timeFilter]="timeFilter()"
      [disabled]="disabled()"
      [readonly]="readonly()"
    >
      <mud-label>Ora</mud-label>
    </mud-time-input>
    <button type="button" id="outside">outside</button>
  `,
})
class Host {
  readonly value = signal<string | null>(null);
  readonly open = signal(false);
  readonly min = signal<string | undefined>(undefined);
  readonly minuteStep = signal<number>(1);
  readonly timeFilter = signal<((t: string) => boolean) | undefined>(undefined);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-time-input') as HTMLElement;
  const native = el.querySelector<HTMLInputElement>('input')!;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    native,
    toggle: () => el.querySelector<HTMLButtonElement>('.time-field__toggle')!,
    dialog: () => document.querySelector<HTMLElement>('.time-field__panel[role="dialog"]'),
    picker: () => document.querySelector<HTMLElement>('mud-time-picker'),
    option: (column: 'hours' | 'minutes', n: number) =>
      document.querySelector<HTMLElement>(`[data-column="${column}"] [data-value="${n}"]`)!,
    async openViaButton() {
      this.toggle().click();
      await fixture.whenStable();
    },
  };
}

describe('MudTimeInput popover', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('opens from the toggle button, not from focus, as a labelled modal dialog', async () => {
    const view = await render();

    view.native.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await view.fixture.whenStable();
    expect(view.dialog()).toBeNull();
    expect(view.toggle().getAttribute('aria-controls')).toBeNull();

    await view.openViaButton();

    expect(view.dialog()).not.toBeNull();
    expect(view.dialog()!.getAttribute('aria-label')).toBe('Time');
    expect(view.dialog()!.getAttribute('aria-modal')).toBe('true');
    expect(view.toggle().getAttribute('aria-expanded')).toBe('true');
    expect(view.toggle().getAttribute('aria-haspopup')).toBe('dialog');
    expect(view.toggle().getAttribute('aria-controls')).toBe(view.dialog()!.id);
    expect(view.picker()!.classList).toContain('time-picker--flat');
    expect(view.el.classList).toContain('is-open');
    expect(view.el.classList).toContain('is-focused');
    expect(view.host.open()).toBe(true);
  });

  it('moves focus onto the picker when opened', async () => {
    const view = await render();

    await view.openViaButton();

    expect((document.activeElement as HTMLElement).getAttribute('role')).toBe('option');
    expect((document.activeElement as HTMLElement).closest('[data-column]')!.getAttribute('data-column')).toBe('hours');
  });

  it('opens on the committed value and forwards min', async () => {
    const view = await render();

    view.host.value.set('09:30');
    view.host.min.set('08:00');
    await view.fixture.whenStable();

    await view.openViaButton();

    expect(view.option('hours', 9).getAttribute('aria-selected')).toBe('true');
    expect(view.option('minutes', 30).getAttribute('aria-selected')).toBe('true');
    expect(view.option('hours', 7).getAttribute('aria-disabled')).toBe('true');
  });

  it('opens with Alt+ArrowDown from the field', async () => {
    const view = await render();

    view.native.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true }),
    );
    await view.fixture.whenStable();

    expect(view.dialog()).not.toBeNull();
  });

  it('writes a completed pick into the field, closes, and returns focus to the input', async () => {
    const view = await render();

    await view.openViaButton();

    view.option('hours', 14).click();
    await view.fixture.whenStable();
    expect(view.dialog()).not.toBeNull();
    expect(view.host.value()).toBeNull();

    view.option('minutes', 5).click();
    await view.fixture.whenStable();

    expect(view.host.value()).toBe('14:05');
    expect(view.native.getAttribute('value')).toBe('14:05');
    expect(view.dialog()).toBeNull();
    expect(view.host.open()).toBe(false);
    expect(document.activeElement).toBe(view.native);
  });

  it('closes on Escape inside the panel and returns focus to the input', async () => {
    const view = await render();

    await view.openViaButton();

    view.dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await view.fixture.whenStable();

    expect(view.dialog()).toBeNull();
    expect(document.activeElement).toBe(view.native);
  });

  it('closes on Escape pressed in the field itself', async () => {
    const view = await render();

    await view.openViaButton();

    view.native.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await view.fixture.whenStable();

    expect(view.dialog()).toBeNull();
  });

  it('closes on an outside click without stealing focus from what was clicked', async () => {
    const view = await render();

    await view.openViaButton();

    const outside = view.fixture.nativeElement.querySelector('#outside') as HTMLElement;

    // CDK reports outsidePointerEvents on `click`, by which point the browser
    // has already focused the clicked element (breadcrumb spec, same lesson).
    outside.focus();
    outside.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true }));
    await view.fixture.whenStable();

    expect(view.dialog()).toBeNull();
    expect(view.host.open()).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it('is driven by the open model in both directions', async () => {
    const view = await render();

    view.host.open.set(true);
    await view.fixture.whenStable();
    expect(view.dialog()).not.toBeNull();

    view.host.open.set(false);
    await view.fixture.whenStable();
    expect(view.dialog()).toBeNull();
  });

  it('cannot be opened while disabled or readonly, and closes when the field becomes disabled', async () => {
    const view = await render();

    view.host.readonly.set(true);
    await view.fixture.whenStable();
    expect(view.toggle().disabled).toBe(true);

    view.host.open.set(true);
    await view.fixture.whenStable();
    expect(view.dialog()).toBeNull();
    expect(view.host.open()).toBe(false);

    view.host.readonly.set(false);
    await view.fixture.whenStable();
    await view.openViaButton();
    expect(view.dialog()).not.toBeNull();

    view.host.disabled.set(true);
    await view.fixture.whenStable();
    expect(view.dialog()).toBeNull();
    expect(view.host.open()).toBe(false);
  });

  it('disposes the overlay when the host is destroyed', async () => {
    const view = await render();

    await view.openViaButton();
    expect(view.dialog()).not.toBeNull();

    view.fixture.destroy();

    expect(document.querySelector('.time-field__panel')).toBeNull();
  });

  it('forwards minuteStep and timeFilter to the picker', async () => {
    const view = await render();

    view.host.minuteStep.set(15);
    view.host.timeFilter.set((t) => !t.startsWith('12'));
    await view.fixture.whenStable();

    await view.openViaButton();

    expect(document.querySelectorAll('[data-column="minutes"] [role="option"]')).toHaveLength(4);
    expect(view.option('hours', 12).getAttribute('aria-disabled')).toBe('true');
  });
});
