import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FlexibleConnectedPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { MudTimeInput } from './mud-time-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';

@Component({
  imports: [MudTimeInput, MudLabel, MudInlineMessage],
  template: `
    <mud-time-input
      [(value)]="value"
      [(open)]="open"
      [min]="min()"
      [max]="max()"
      [minuteStep]="minuteStep()"
      [timeFilter]="timeFilter()"
      [clearable]="clearable()"
      [disabled]="disabled()"
      [placeholder]="placeholder()"
      [aria-label]="ariaLabel()"
      (cleared)="clearedCount.set(clearedCount() + 1)"
    >
      @if (withLabel()) {
        <mud-label>Ora</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Alegeți o oră.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Oră invalidă.</mud-inline-message>
      }
    </mud-time-input>
  `,
})
class Host {
  readonly value = signal<string | null>(null);
  readonly open = signal(false);
  readonly min = signal<string | undefined>(undefined);
  readonly max = signal<string | undefined>(undefined);
  readonly minuteStep = signal<number>(1);
  readonly timeFilter = signal<((t: string) => boolean) | undefined>(undefined);
  readonly clearable = signal(false);
  readonly disabled = signal(false);
  readonly placeholder = signal<string | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly clearedCount = signal(0);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
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
    ghost: () => el.querySelector('.time-field__ghost')!.textContent!,
    ghostHidden: () => el.querySelector('.time-field__ghost-row')!.classList.contains('time-field__ghost-row--hidden'),
    async type(text: string) {
      native.value = text;
      native.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    },
    async press(key: string, init: KeyboardEventInit = {}) {
      native.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
      await fixture.whenStable();
    },
    async blur() {
      native.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      await fixture.whenStable();
    },
  };
}

describe('MudTimeInput', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  // jsdom has no layout, so this pins the configuration; the geometry was checked in Chromium on a
  // landscape phone, a short window and a right-edge field — all stay on screen.
  it('keeps the dropdown on screen: right-aligned fallbacks, then pushed when nothing fits', async () => {
    const push = vi.spyOn(FlexibleConnectedPositionStrategy.prototype, 'withPush');
    const create = vi.spyOn(Overlay.prototype, 'create');
    const view = await render();

    try {
      view.el.querySelector<HTMLButtonElement>('.time-field__toggle')!.click();
      await view.fixture.whenStable();

      const strategy = create.mock.calls.at(-1)![0]!.positionStrategy as FlexibleConnectedPositionStrategy;

      expect(push).toHaveBeenLastCalledWith(true);
      expect(strategy.positions.map((p) => `${p.originX}-${p.originY}`)).toEqual([
        'start-bottom',
        'start-top',
        'end-bottom',
        'end-top',
      ]);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('caps the panel height to the screen so a short window scrolls it', () => {
    TestBed.createComponent(Host).detectChanges();

    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.time-field__panel\s*\{[^}]*max-height:\s*calc\(100dvh - 16px\)/);
  });

  it('wires the field ARIA and describes the expected format', async () => {
    const view = await render();
    const label = view.el.querySelector('.input-field__label')!;
    const hint = view.el.querySelector('.time-field__format-hint')!;

    expect(view.el.classList).toContain('input-field');
    expect(view.el.classList).toContain('time-field');
    expect(view.native.getAttribute('type')).toBe('text');
    expect(view.native.getAttribute('inputmode')).toBe('numeric');
    expect(view.native.getAttribute('autocomplete')).toBe('off');
    expect(view.native.getAttribute('placeholder')).toBe('HH:MM');
    expect(view.native.getAttribute('aria-labelledby')).toBe(label.id);
    expect(view.native.getAttribute('aria-describedby')).toContain(hint.id);
    expect(hint.textContent!.trim()).toBe('Time format: HH:MM');
    expect(label.textContent).toContain('Ora');
    expect(view.el.querySelector('.time-field__toggle')!.getAttribute('aria-label')).toBe('Open time picker');
  });

  it('uses a consumer placeholder and aria-label when given', async () => {
    const view = await render();

    view.host.placeholder.set('--:--');
    view.host.ariaLabel.set('Ora');
    await view.fixture.whenStable();

    // A projected <mud-label> wins over aria-label.
    expect(view.native.getAttribute('placeholder')).toBe('--:--');
    expect(view.native.getAttribute('aria-label')).toBeNull();

    view.host.withLabel.set(false);
    await view.fixture.whenStable();

    expect(view.el.querySelector('.input-field__label')).toBeNull();
    expect(view.native.getAttribute('aria-labelledby')).toBeNull();
    expect(view.native.getAttribute('aria-label')).toBe('Ora');
  });

  it('derives the ghost and the format hint from a same-shape placeholder', async () => {
    const view = await render();

    view.host.placeholder.set('OO:MM');
    await view.fixture.whenStable();

    expect(view.el.querySelector('.time-field__format-hint')!.textContent!.trim()).toBe('Time format: OO:MM');

    // Typing must not reveal the internal HH:MM pattern behind the consumer's.
    await view.type('0');
    expect(view.ghost()).toBe('O:MM');

    await view.type('05:30');
    await view.type('0');
    expect(view.ghost()).toBe('O:MM');
  });

  it('ignores a placeholder that does not have the HH:MM shape, warning in dev mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = await render();

    view.host.placeholder.set('Ora');
    await view.fixture.whenStable();

    expect(view.native.getAttribute('placeholder')).toBe('HH:MM');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[mud-time-input] placeholder'));

    view.host.placeholder.set('00:00');
    await view.fixture.whenStable();

    // Digits would be indistinguishable from typed input in the ghost.
    expect(view.native.getAttribute('placeholder')).toBe('HH:MM');

    warn.mockRestore();
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby', async () => {
    const view = await render();

    expect(view.el.querySelector('.input-field__assistive')).toBeNull();

    view.host.showHelper.set(true);
    await view.fixture.whenStable();

    const wrapper = view.el.querySelector('.input-field__assistive')!;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.textContent).toContain('Alegeți o oră.');
    expect(view.native.getAttribute('aria-describedby')).toContain(wrapper.id);

    view.host.showHelper.set(false);
    view.host.showError.set(true);
    await view.fixture.whenStable();

    expect(view.el.querySelector('.input-field__assistive')!.textContent).toContain('Oră invalidă.');
  });

  it('masks digits as they are typed, with a lazy separator', async () => {
    const view = await render();

    await view.type('0');
    expect(view.native.value).toBe('0');

    await view.type('09');
    expect(view.native.value).toBe('09');

    await view.type('093');
    expect(view.native.value).toBe('09:3');

    await view.type('09:30');
    expect(view.native.value).toBe('09:30');
  });

  it('pads a first digit that cannot start a segment and drops an overflowing second digit', async () => {
    const view = await render();

    await view.type('9');
    expect(view.native.value).toBe('09');

    await view.type('097');
    expect(view.native.value).toBe('09:07');

    await view.type('');
    await view.type('2');
    await view.type('27');
    expect(view.native.value).toBe('2');
  });

  it('deletes a complete value one character at a time down to empty', async () => {
    const view = await render();

    await view.type('09:30');

    for (const expected of ['09:3', '09', '0', '']) {
      await view.type(view.native.value.slice(0, -1));
      expect(view.native.value).toBe(expected);
    }
  });

  it('pads a lone hour digit when ":" is typed', async () => {
    const view = await render();

    await view.type('2');
    await view.press(':');

    expect(view.native.value).toBe('02');
    expect(view.ghost()).toBe(':MM');
  });

  it('leaves ":" alone when the display is empty or complete', async () => {
    const view = await render();

    const empty = new KeyboardEvent('keydown', { key: ':', bubbles: true, cancelable: true });

    view.native.dispatchEvent(empty);
    await view.fixture.whenStable();
    expect(empty.defaultPrevented).toBe(false);
    expect(view.native.value).toBe('');

    await view.type('09:30');

    const complete = new KeyboardEvent('keydown', { key: ':', bubbles: true, cancelable: true });

    view.native.dispatchEvent(complete);
    await view.fixture.whenStable();
    expect(complete.defaultPrevented).toBe(false);
    expect(view.native.value).toBe('09:30');
  });

  it('shows the untyped tail as a ghost only mid-typing', async () => {
    const view = await render();

    expect(view.ghostHidden()).toBe(true);

    await view.type('09');
    expect(view.ghost()).toBe(':MM');
    expect(view.ghostHidden()).toBe(false);

    await view.type('09:30');
    expect(view.ghostHidden()).toBe(true);
  });

  it('commits once the entry is complete and within bounds', async () => {
    const view = await render();

    await view.type('09:3');
    expect(view.host.value()).toBeNull();

    await view.type('09:30');
    expect(view.host.value()).toBe('09:30');

    view.host.min.set('10:00');
    await view.fixture.whenStable();

    await view.type('09:45');
    expect(view.host.value()).toBeNull();

    await view.type('10:00');
    expect(view.host.value()).toBe('10:00');
  });

  it('ignores a malformed bound instead of blocking every commit', async () => {
    const view = await render();

    view.host.max.set('5pm');
    await view.fixture.whenStable();

    await view.type('18:00');

    expect(view.host.value()).toBe('18:00');
  });

  it('refuses every time under inverted bounds but still clears', async () => {
    const view = await render();

    view.host.min.set('18:00');
    view.host.max.set('09:00');
    await view.fixture.whenStable();

    await view.type('12:00');
    expect(view.host.value()).toBeNull();

    await view.type('');
    expect(view.native.value).toBe('');
  });

  it('renders an externally set value and empties on null', async () => {
    const view = await render();

    view.host.value.set('07:05');
    await view.fixture.whenStable();
    expect(view.native.getAttribute('value')).toBe('07:05');

    view.host.value.set(null);
    await view.fixture.whenStable();
    expect(view.native.getAttribute('value')).toBe('');
  });

  it('renders a malformed external value as empty and warns in dev mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = await render();

    view.host.value.set('9:05');
    await view.fixture.whenStable();

    expect(view.native.getAttribute('value')).toBe('');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[mud-time-input]'));

    warn.mockRestore();
  });

  it('reverts a refused entry to the last usable value on blur', async () => {
    const view = await render();

    view.host.max.set('17:00');
    await view.fixture.whenStable();

    await view.type('09:30');
    expect(view.host.value()).toBe('09:30');

    await view.type('18:30');
    expect(view.host.value()).toBeNull();

    await view.blur();

    expect(view.native.getAttribute('value')).toBe('09:30');
    expect(view.host.value()).toBe('09:30');
  });

  it('reverts an incomplete entry to the last usable value on blur', async () => {
    const view = await render();

    await view.type('09:30');
    await view.type('09:3');
    await view.blur();

    expect(view.native.getAttribute('value')).toBe('09:30');
    expect(view.host.value()).toBe('09:30');
  });

  it('drops an incomplete entry with nothing to revert to', async () => {
    const view = await render();

    await view.type('09:3');
    await view.blur();

    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.value()).toBeNull();
  });

  it('leaves a valid entry alone and an emptied field empty on blur', async () => {
    const view = await render();

    await view.type('09:30');
    await view.blur();
    expect(view.host.value()).toBe('09:30');

    await view.type('');
    await view.blur();
    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.value()).toBeNull();
  });

  it('does not resurrect a value the consumer reset', async () => {
    const view = await render();

    // Two commits, so the revert history holds 09:30 when the reset lands.
    await view.type('09:30');
    await view.type('09:35');
    expect(view.host.value()).toBe('09:35');

    view.host.value.set(null);
    await view.fixture.whenStable();
    expect(view.native.getAttribute('value')).toBe('');

    await view.type('1');
    await view.blur();

    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.value()).toBeNull();
  });

  it('does not resurrect a value the user deleted before typing afresh', async () => {
    const view = await render();

    await view.type('09:30');
    await view.type('');
    await view.type('1');
    await view.blur();

    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.value()).toBeNull();
  });

  it('leaves an untouched entry alone on blur when the bounds changed after it was committed', async () => {
    const view = await render();

    await view.type('09:30');
    await view.type('10:00');
    expect(view.host.value()).toBe('10:00');

    // The start/end pair case: the consumer raises min after the end time
    // was committed, then the user tabs through the field without typing.
    view.host.min.set('11:00');
    await view.fixture.whenStable();

    await view.blur();

    expect(view.host.value()).toBe('10:00');
    expect(view.native.getAttribute('value')).toBe('10:00');
  });

  it('shows the clear button only when clearable and filled, and clears through it', async () => {
    const view = await render();

    expect(view.el.querySelector('.input-field__clear')).toBeNull();

    view.host.clearable.set(true);
    await view.fixture.whenStable();
    expect(view.el.querySelector('.input-field__clear')).toBeNull();

    await view.type('09:3');
    const clear = view.el.querySelector<HTMLButtonElement>('.input-field__clear')!;

    expect(clear.getAttribute('aria-label')).toBe('Clear');

    clear.click();
    await view.fixture.whenStable();

    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.value()).toBeNull();
    expect(view.host.clearedCount()).toBe(1);
    expect(view.el.querySelector('.input-field__clear')).toBeNull();

    // Clearing is deliberate: blur must not bring the old value back.
    await view.blur();
    expect(view.host.value()).toBeNull();
  });

  it('emits cleared only from the button, not from an emptied field', async () => {
    const view = await render();

    await view.type('09:30');
    await view.type('');

    expect(view.host.clearedCount()).toBe(0);
  });

  it('reflects disabled on the control and the toggle', async () => {
    const view = await render();

    view.host.disabled.set(true);
    await view.fixture.whenStable();

    expect(view.native.disabled).toBe(true);
    expect(view.el.querySelector<HTMLButtonElement>('.time-field__toggle')!.disabled).toBe(true);
    expect(view.el.classList).toContain('is-disabled');
  });

  it('refuses a typed minute off the step and reverts it on blur', async () => {
    const view = await render();

    view.host.minuteStep.set(15);
    await view.fixture.whenStable();

    await view.type('09:15');
    expect(view.host.value()).toBe('09:15');

    await view.type('09:07');
    expect(view.host.value()).toBeNull();

    await view.blur();

    expect(view.host.value()).toBe('09:15');
    expect(view.native.getAttribute('value')).toBe('09:15');
  });

  it('refuses a typed time the filter rejects', async () => {
    const view = await render();

    view.host.timeFilter.set((t) => !t.startsWith('12'));
    await view.fixture.whenStable();

    await view.type('12:30');
    expect(view.host.value()).toBeNull();

    await view.type('13:30');
    expect(view.host.value()).toBe('13:30');
  });

  it('falls back to a 1-minute step for an unlisted value, warning once in dev mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = await render();

    view.host.minuteStep.set(7);
    await view.fixture.whenStable();

    await view.type('09:07');
    expect(view.host.value()).toBe('09:07');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[mud-time-input]'));

    warn.mockRestore();
  });
});
