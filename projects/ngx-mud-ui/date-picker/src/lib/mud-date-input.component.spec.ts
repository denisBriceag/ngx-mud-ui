import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BlockScrollStrategy, FlexibleConnectedPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudDateInput } from './mud-date-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';

@Component({
  imports: [MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <mud-date-input
      [(value)]="value"
      [(open)]="open"
      [format]="format()"
      [min]="min()"
      [max]="max()"
      [clearable]="clearable()"
      [disabled]="disabled()"
      [placeholder]="placeholder()"
      locale="en-GB"
      (cleared)="clearedCount.set(clearedCount() + 1)"
    >
      @if (withLabel()) {
        <mud-label>Data nașterii</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Alegeți o dată din calendar.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Dată invalidă.</mud-inline-message>
      }
    </mud-date-input>
  `,
})
class Host {
  readonly value = signal<string | null>(null);
  readonly open = signal(false);
  readonly format = signal<'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'>('DD/MM/YYYY');
  readonly min = signal<string | undefined>(undefined);
  readonly max = signal<string | undefined>(undefined);
  readonly clearable = signal(false);
  readonly placeholder = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly clearedCount = signal(0);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-date-input') as HTMLElement;
  const native = el.querySelector<HTMLInputElement>('input')!;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    native,
    toggle: () => el.querySelector<HTMLButtonElement>('.date-field__toggle')!,
    ghost: () => el.querySelector('.date-field__ghost')!.textContent!,
    panel: () => document.querySelector<HTMLElement>('.date-picker'),
    dialog: () => document.querySelector<HTMLElement>('[role="dialog"]'),
    async type(text: string) {
      native.value = text;
      native.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    },
    /** Backspace at the end of the field: the browser drops the last character
     *  and the component re-masks whatever is left. */
    async backspace() {
      native.value = native.value.slice(0, -1);
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

describe('MudDateInput', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('wires the field ARIA, describing the expected format', async () => {
    const view = await render();
    const label = view.el.querySelector('.input-field__label')!;
    const hint = view.el.querySelector('.date-field__format-hint')!;

    expect(view.native.getAttribute('type')).toBe('text');
    expect(view.native.getAttribute('inputmode')).toBe('numeric');
    expect(view.native.getAttribute('aria-labelledby')).toBe(label.id);
    expect(view.native.getAttribute('aria-describedby')).toContain(hint.id);
    expect(hint.textContent!.trim()).toBe('Date format: DD/MM/YYYY');
  });

  it('renders the projected mud-label inside the field label element', async () => {
    const view = await render();
    const label = view.el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(label.textContent).toContain('Data nașterii');
    expect(label.htmlFor).toBe(view.native.id);
    expect(view.native.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('renders no label element without a projected mud-label; no labelledby either', async () => {
    const view = await render();

    view.host.withLabel.set(false);
    await view.fixture.whenStable();

    expect(view.el.querySelector('.input-field__label')).toBeNull();
    expect(view.native.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders no assistive wrapper when nothing is projected; describedby keeps only the format hint', async () => {
    const view = await render();
    const hint = view.el.querySelector('.date-field__format-hint')!;

    expect(view.el.querySelector('.input-field__assistive')).toBeNull();
    expect(view.native.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby', async () => {
    const view = await render();
    const hint = view.el.querySelector('.date-field__format-hint')!;

    view.host.showHelper.set(true);
    await view.fixture.whenStable();

    const wrapper = view.el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain(
      'Alegeți o dată din calendar.',
    );
    expect(view.native.getAttribute('aria-describedby')).toBe(`${hint.id} ${wrapper.id}`);
  });

  it('lets the consumer swap helper for error — both land in the same wrapper', async () => {
    const view = await render();

    view.host.showHelper.set(true);
    await view.fixture.whenStable();
    view.host.showHelper.set(false);
    view.host.showError.set(true);
    await view.fixture.whenStable();

    const wrapper = view.el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.textContent).toContain('Dată invalidă.');
    expect(wrapper.textContent).not.toContain('Alegeți o dată din calendar.');
  });

  it('can show two messages at once, in template order', async () => {
    const view = await render();

    view.host.showHelper.set(true);
    view.host.showError.set(true);
    await view.fixture.whenStable();

    const messages = view.el.querySelectorAll('.input-field__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Alegeți o dată din calendar.');
    expect(messages[1].textContent).toContain('Dată invalidă.');
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const hint = fixture.nativeElement.querySelector('.date-field__format-hint') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${hint.id} extra-id`);

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${hint.id} ${wrapper.id} extra-id`);
  });

  it('masks digits as they are typed', async () => {
    const view = await render();

    await view.type('1');
    expect(view.native.value).toBe('1');

    // No trailing separator: the mask holds it back until a digit follows, so
    // Backspace can delete backwards. See the deletion test below.
    await view.type('15');
    expect(view.native.value).toBe('15');

    await view.type('150');
    expect(view.native.value).toBe('15/0');

    await view.type('15/04');
    expect(view.native.value).toBe('15/04');
  });

  it('deletes a complete value one character at a time all the way to empty', async () => {
    const view = await render();

    view.host.value.set('2026-04-15');
    await view.fixture.whenStable();
    expect(view.native.value).toBe('15/04/2026');

    const seen: string[] = [];

    for (let i = 0; i < 10; i += 1) {
      await view.backspace();
      seen.push(view.native.value);
    }

    // An eagerly-appended separator made this impossible: Backspace removed the
    // "/", the re-mask put it straight back, and the field stuck at '15/04/'
    // forever — the user could never delete the month, never the day, and never
    // clear the field with Backspace at all.
    expect(seen).toEqual([
      '15/04/202',
      '15/04/20',
      '15/04/2',
      '15/04',
      '15/0',
      '15',
      '1',
      '',
      '',
      '',
    ]);
    expect(view.host.value()).toBeNull();
  });

  it('shows the untyped tail of the pattern as a ghost', async () => {
    const view = await render();

    expect(view.ghost()).toBe('DD/MM/YYYY');

    // The ghost now OPENS with the held-back separator; the offset is the
    // display length either way, so the tail still lines up with the caret.
    await view.type('15/04');
    expect(view.ghost()).toBe('/YYYY');

    await view.type('15/04/2026');
    expect(view.ghost()).toBe('');
  });

  it('paints the ghost row only mid-typing, never for an empty or complete entry', async () => {
    const view = await render();
    const hidden = () =>
      view.el.querySelector('.date-field__ghost-row')!.classList.contains('date-field__ghost-row--hidden');

    // Empty: the native placeholder is the hint; a visible ghost row would be
    // the axe color-contrast bail (overlapped text) all over again.
    expect(hidden()).toBe(true);
    expect(view.native.getAttribute('placeholder')).toBe('DD/MM/YYYY');

    await view.type('15/04');
    expect(hidden()).toBe(false);

    // Complete: even the transparent typed-spacer holds text axe would check.
    await view.type('15/04/2026');
    expect(hidden()).toBe(true);
  });

  it('commits the ISO value once the entry is complete and valid', async () => {
    const view = await render();

    await view.type('15/04/202');
    expect(view.host.value()).toBeNull();

    await view.type('15/04/2026');
    expect(view.host.value()).toBe('2026-04-15');
  });

  it('refuses an impossible date', async () => {
    const view = await render();

    await view.type('31/02/2026');

    expect(view.host.value()).toBeNull();
  });

  it('refuses a date outside min/max', async () => {
    const view = await render();

    view.host.min.set('2026-05-01');
    await view.fixture.whenStable();

    await view.type('15/04/2026');

    expect(view.host.value()).toBeNull();
  });

  it('ignores a malformed min instead of blocking every commit', async () => {
    const view = await render();

    // A bound arriving from outside the component (e.g. a signal-forms schema)
    // is name-matched at runtime with no compile-time check, so it can carry
    // anything. `as never` simulates that here.
    view.host.min.set('not-a-date' as never);
    await view.fixture.whenStable();

    await view.type('15/04/2026');

    expect(view.host.value()).toBe('2026-04-15');
  });

  it('renders an externally set value in the configured format', async () => {
    const view = await render();

    view.host.value.set('2026-04-15');
    await view.fixture.whenStable();
    expect(view.native.getAttribute('value')).toBe('15/04/2026');

    view.host.format.set('YYYY-MM-DD');
    await view.fixture.whenStable();
    expect(view.native.getAttribute('value')).toBe('2026-04-15');
  });

  it('clears the value when the field is emptied', async () => {
    const view = await render();

    await view.type('15/04/2026');
    await view.type('');

    expect(view.host.value()).toBeNull();
  });

  it('keeps the ghost and clear button in step while editing a complete value down to an incomplete one', async () => {
    const view = await render();

    view.host.clearable.set(true);
    view.host.value.set('2026-04-15');
    await view.fixture.whenStable();

    // A single input event replacing the complete '15/04/2026' with the
    // incomplete '15/0': committing the incomplete entry emits null, which is
    // `_draft`'s linkedSignal source, so a naive "set draft, then commit"
    // ordering would have that source change discard the draft write and
    // snap the ghost back to the full untyped pattern for a render.
    await view.type('15/0');

    expect(view.ghost()).toBe('M/YYYY');
    expect(view.ghost()).not.toBe('DD/MM/YYYY');
    expect(view.el.querySelector('.input-field__clear')).not.toBeNull();
  });

  it('opens the calendar from the toggle button, not from focus', async () => {
    const view = await render();

    view.native.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await view.fixture.whenStable();
    expect(view.panel()).toBeNull();

    view.toggle().click();
    await view.fixture.whenStable();
    expect(view.panel()).not.toBeNull();
    expect(view.dialog()!.getAttribute('aria-label')).toBe('Calendar');
    expect(view.dialog()!.getAttribute('aria-modal')).toBe('true');
    expect(view.toggle().getAttribute('aria-expanded')).toBe('true');
    expect(view.toggle().getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('opens with Alt+ArrowDown from the field', async () => {
    const view = await render();

    await view.press('ArrowDown', { altKey: true });

    expect(view.panel()).not.toBeNull();
  });

  it('writes the picked day back into the field and closes', async () => {
    const view = await render();

    view.host.value.set('2026-04-15');
    await view.fixture.whenStable();

    view.toggle().click();
    await view.fixture.whenStable();

    document.querySelector<HTMLButtonElement>('[data-iso="2026-04-20"] button')!.click();
    await view.fixture.whenStable();

    expect(view.host.value()).toBe('2026-04-20');
    expect(view.native.getAttribute('value')).toBe('20/04/2026');
    expect(view.panel()).toBeNull();
  });

  it('closes on Escape', async () => {
    const view = await render();

    view.toggle().click();
    await view.fixture.whenStable();

    view.dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await view.fixture.whenStable();

    expect(view.panel()).toBeNull();
  });

  it('closes on Escape pressed in the field itself', async () => {
    const view = await render();

    view.toggle().click();
    await view.fixture.whenStable();
    expect(view.panel()).not.toBeNull();

    // Clicking back into the input moves focus out of the trapped dialog
    // without closing it (the outside-click handler exempts the control), so
    // Escape has to work from the field too.
    await view.press('Escape');

    expect(view.panel()).toBeNull();
  });

  it('shows the clear button only when clearable and filled', async () => {
    const view = await render();

    expect(view.el.querySelector('.input-field__clear')).toBeNull();

    view.host.clearable.set(true);
    await view.fixture.whenStable();
    expect(view.el.querySelector('.input-field__clear')).toBeNull();

    view.host.value.set('2026-04-15');
    await view.fixture.whenStable();

    const clear = view.el.querySelector<HTMLButtonElement>('.input-field__clear')!;

    clear.click();
    await view.fixture.whenStable();

    expect(view.host.value()).toBeNull();
    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.clearedCount()).toBe(1);
  });

  it('emits cleared only from the clear button, not from an emptied field', async () => {
    const view = await render();

    view.host.clearable.set(true);
    await view.fixture.whenStable();

    await view.type('15/04/2026');
    await view.type('');

    expect(view.host.clearedCount()).toBe(0);

    await view.type('15/04/2026');
    view.el.querySelector<HTMLButtonElement>('.input-field__clear')!.click();
    await view.fixture.whenStable();

    expect(view.host.clearedCount()).toBe(1);
  });

  it('reverts a refused entry to the last usable value on blur', async () => {
    const view = await render();

    view.host.max.set('2026-12-31');
    await view.fixture.whenStable();

    await view.type('15/04/2026');
    expect(view.host.value()).toBe('2026-04-15');

    // Out of range, so the commit while typing is refused and `value` goes
    // null. Leaving the rejected text on screen next to a null value — and
    // losing the date that WAS there — is what this reverts.
    await view.type('15/04/2030');
    expect(view.host.value()).toBeNull();

    await view.blur();

    expect(view.native.getAttribute('value')).toBe('15/04/2026');
    expect(view.host.value()).toBe('2026-04-15');
  });

  it('reverts an incomplete entry to the last usable value on blur', async () => {
    const view = await render();

    await view.type('15/04/2026');
    await view.type('15/0');
    await view.blur();

    expect(view.native.getAttribute('value')).toBe('15/04/2026');
    expect(view.host.value()).toBe('2026-04-15');
  });

  it('leaves a valid entry alone on blur', async () => {
    const view = await render();

    await view.type('15/04/2026');
    await view.blur();

    expect(view.native.getAttribute('value')).toBe('15/04/2026');
    expect(view.host.value()).toBe('2026-04-15');
  });

  it('leaves an emptied field empty on blur instead of restoring what was deleted', async () => {
    const view = await render();

    await view.type('15/04/2026');
    await view.type('');
    await view.blur();

    // Deleting everything is a deliberate "no date", not a failed edit.
    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.value()).toBeNull();
  });

  it('cannot be opened while disabled', async () => {
    const view = await render();

    view.host.disabled.set(true);
    await view.fixture.whenStable();

    // The toggle button is natively `disabled`, so the browser blocks this
    // click regardless of whether `_toggle`'s own guard exists.
    view.toggle().click();
    await view.fixture.whenStable();
    expect(view.panel()).toBeNull();

    // Alt+ArrowDown reaches `_openPanel` directly through `_onKeydown`,
    // without going through a disabled DOM element, so this is what actually
    // exercises `_openPanel`'s own disabled guard.
    await view.press('ArrowDown', { altKey: true });
    expect(view.panel()).toBeNull();
  });

  it('drives a reactive form control', async () => {
    @Component({
      imports: [MudDateInput, ReactiveFormsModule],
      template: `<mud-date-input [formControl]="control" locale="en-GB" />`,
    })
    class ReactiveHost {
      readonly control = new FormControl<string | null>(null);
    }

    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();

    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    native.value = '15/04/2026';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe('2026-04-15');
  });
  it('leaves an untouched entry alone on blur when the bounds changed after it was committed', async () => {
    const view = await render();

    await view.type('15/04/2026');
    await view.type('20/04/2026');
    expect(view.host.value()).toBe('2026-04-20');

    // The start/end pair case: the consumer raises min after the end date was
    // committed, then the user tabs through the field without typing.
    view.host.min.set('2026-05-01');
    await view.fixture.whenStable();

    await view.blur();

    expect(view.host.value()).toBe('2026-04-20');
    expect(view.native.getAttribute('value')).toBe('20/04/2026');
  });

  it('does not resurrect a value the consumer reset', async () => {
    const view = await render();

    // Two commits, so the revert history holds the first date when the reset lands.
    await view.type('15/04/2026');
    await view.type('20/04/2026');
    expect(view.host.value()).toBe('2026-04-20');

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

    await view.type('15/04/2026');
    await view.type('');
    await view.type('1');
    await view.blur();

    expect(view.native.getAttribute('value')).toBe('');
    expect(view.host.value()).toBeNull();
  });

  it('derives the ghost and the format hint from a same-shape placeholder', async () => {
    const view = await render();

    view.host.placeholder.set('ZZ/LL/AAAA');
    await view.fixture.whenStable();

    expect(view.native.getAttribute('placeholder')).toBe('ZZ/LL/AAAA');
    expect(view.el.querySelector('.date-field__format-hint')!.textContent!.trim()).toBe('Date format: ZZ/LL/AAAA');

    // Typing must not reveal the internal DD/MM/YYYY pattern behind the consumer's.
    await view.type('1');
    expect(view.ghost()).toBe('Z/LL/AAAA');

    await view.type('15/04/2026');
    await view.type('1');
    expect(view.ghost()).toBe('Z/LL/AAAA');
  });

  it('ignores a placeholder that does not have the format shape, warning in dev mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = await render();

    view.host.placeholder.set('Data');
    await view.fixture.whenStable();

    expect(view.native.getAttribute('placeholder')).toBe('DD/MM/YYYY');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[mud-date-input] placeholder'));

    // Digits would blend into typed input; a shape for ANOTHER format is wrong too.
    view.host.placeholder.set('00/00/0000');
    await view.fixture.whenStable();
    expect(view.native.getAttribute('placeholder')).toBe('DD/MM/YYYY');

    view.host.placeholder.set('AAAA-LL-ZZ');
    await view.fixture.whenStable();
    expect(view.native.getAttribute('placeholder')).toBe('DD/MM/YYYY');

    // The same string is right once the format matches it.
    view.host.format.set('YYYY-MM-DD');
    await view.fixture.whenStable();
    expect(view.native.getAttribute('placeholder')).toBe('AAAA-LL-ZZ');

    warn.mockRestore();
  });

});

describe('MudDateInput signal forms (FormValueControl)', () => {
  it('binds value both ways through the Field directive, and marks touch on blur', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(host.form.dob().touched()).toBe(false);

    // (a) typing a date in the field updates the field's value.
    native.value = '15/04/2026';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(host.model().dob).toBe('2026-04-15');
    expect(host.form.dob().value()).toBe('2026-04-15');

    // (c) the `touch` output marks the field touched.
    native.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await fixture.whenStable();

    expect(host.form.dob().touched()).toBe(true);

    // (b) an external schema write reaches the component's display.
    host.model.set({ dob: '2026-08-05' });
    await fixture.whenStable();

    expect(native.getAttribute('value')).toBe('05/08/2026');
  });

  it('surfaces the required-validator invalid state; the consumer projects the message', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const el = fixture.nativeElement.querySelector('mud-date-input') as HTMLElement;

    // Asserting `form.dob().invalid()` here would only prove signal forms
    // works — it passes with this component deleted. What the COMPONENT owes
    // the user is the invalid state on the control; the message text is the
    // consumer's own projected `mud-inline-message`, not something this
    // component renders itself.
    expect(native.getAttribute('aria-invalid')).toBe('true');
    expect(el.classList).toContain('is-invalid');
    expect(el.querySelector('.input-field__assistive')!.textContent).toContain('Alegeți o dată.');
    expect(el.querySelector('.input-field__assistive')!.getAttribute('role')).toBe('alert');

    fixture.componentInstance.model.set({ dob: '2026-04-15' });
    await fixture.whenStable();

    expect(native.getAttribute('aria-invalid')).toBeNull();
    expect(el.querySelector('.input-field__assistive')).toBeNull();
  });
});

@Component({
  imports: [MudDateInput, FormField, MudLabel, MudInlineMessage],
  template: `
    <mud-date-input [formField]="form.dob" locale="en-GB">
      <mud-label>Date</mud-label>
      @if (form.dob().invalid()) {
        <mud-inline-message variant="error">Alegeți o dată.</mud-inline-message>
      }
    </mud-date-input>
  `,
})
class SignalHost {
  readonly model = signal<{ dob: string | null }>({ dob: null });

  readonly form = form(this.model, (path) => {
    required(path.dob, { message: 'Alegeți o dată.' });
  });
}

@Component({
  imports: [MudDateInput, MudInlineMessage],
  template: `
    <mud-date-input aria-describedby="extra-id" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Alegeți o dată din calendar.</mud-inline-message>
      }
    </mud-date-input>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly value = signal<string | null>(null);
  readonly showMessage = signal(false);
}

@Component({
  imports: [MudDateInput],
  template: `
    <mud-date-input
      aria-label="Data"
      locale="en-GB"
      [headerStyle]="headerStyle()"
      [touchUi]="touchUi()"
      [(value)]="value"
      [(open)]="open"
    />
  `,
})
class TouchHost {
  readonly headerStyle = signal<'title' | 'dropdown' | undefined>(undefined);
  readonly touchUi = signal(false);
  readonly value = signal<string | null>('2026-04-15');
  readonly open = signal(false);
}

describe('MudDateInput header style and touchUi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  async function renderTouch(setup: (host: TouchHost) => void = () => undefined) {
    const fixture = TestBed.createComponent(TouchHost);

    setup(fixture.componentInstance);
    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-date-input') as HTMLElement;

    return {
      fixture,
      host: fixture.componentInstance,
      native: el.querySelector<HTMLInputElement>('input')!,
      async openPanel() {
        el.querySelector<HTMLButtonElement>('.date-field__toggle')!.click();
        await fixture.whenStable();
      },
      monthDropdown: () => document.querySelector('.date-picker [data-header="month"]'),
      title: () => document.querySelector('.date-picker .date-picker__title'),
      backdrop: () => document.querySelector<HTMLElement>('.cdk-overlay-backdrop.mud-date-input-backdrop'),
      dialog: () => document.querySelector<HTMLElement>('[role="dialog"]'),
    };
  }

  it('shows the month/year title by default', async () => {
    const view = await renderTouch();

    await view.openPanel();

    expect(view.title()).not.toBeNull();
    expect(view.monthDropdown()).toBeNull();
  });

  it('headerStyle="dropdown" passes the month and year dropdowns through to the calendar', async () => {
    const view = await renderTouch((host) => host.headerStyle.set('dropdown'));

    await view.openPanel();

    expect(view.monthDropdown()).not.toBeNull();
    expect(view.title()).toBeNull();
  });

  it('without touchUi the calendar drops down under the field with no backdrop', async () => {
    const view = await renderTouch();

    await view.openPanel();

    expect(view.backdrop()).toBeNull();
    expect(view.dialog()!.closest('.cdk-global-overlay-wrapper')).toBeNull();
    expect(view.dialog()!.classList).not.toContain('date-field__panel--touch');
  });

  // jsdom has no layout, so this pins the configuration; the geometry was checked in Chromium at
  // 320×568, 375×667, 568×320, a right-edge field and a short window — all stay on screen.
  it('keeps the dropdown on screen: right-aligned fallbacks, then pushed when nothing fits', async () => {
    const push = vi.spyOn(FlexibleConnectedPositionStrategy.prototype, 'withPush');
    const create = vi.spyOn(Overlay.prototype, 'create');
    const view = await renderTouch();

    await view.openPanel();

    const strategy = create.mock.calls.at(-1)![0]!.positionStrategy as FlexibleConnectedPositionStrategy;

    expect(push).toHaveBeenLastCalledWith(true);
    expect(strategy.positions.map((p) => `${p.originX}-${p.originY}`)).toEqual([
      'start-bottom',
      'start-top',
      'end-bottom',
      'end-top',
    ]);
  });

  it('caps the panel to the screen so a phone narrows it and a short window scrolls it', () => {
    TestBed.createComponent(TouchHost).detectChanges();

    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.date-field__panel\s*\{[^}]*max-height:\s*calc\(100dvh - 16px\)/);
    expect(css).toMatch(/\.date-field__panel \.date-picker\s*\{[^}]*max-width:\s*calc\(100vw - 32px\)/);
  });

  it('touchUi opens the calendar centred over a backdrop and blocks page scroll', async () => {
    const create = vi.spyOn(Overlay.prototype, 'create');
    const view = await renderTouch((host) => host.touchUi.set(true));

    await view.openPanel();

    expect(view.backdrop()).not.toBeNull();
    // Global (centred) positioning wraps the pane in CDK's global wrapper.
    expect(view.dialog()!.closest('.cdk-global-overlay-wrapper')).not.toBeNull();
    expect(view.dialog()!.classList).toContain('date-field__panel--touch');
    expect(view.dialog()!.getAttribute('aria-modal')).toBe('true');
    expect(create.mock.calls.at(-1)![0]!.scrollStrategy).toBeInstanceOf(BlockScrollStrategy);
  });

  it('touchUi defaults the header to the dropdowns; an explicit headerStyle wins', async () => {
    const view = await renderTouch((host) => host.touchUi.set(true));

    await view.openPanel();
    expect(view.monthDropdown()).not.toBeNull();

    view.host.open.set(false);
    view.host.headerStyle.set('title');
    await view.fixture.whenStable();
    await view.openPanel();

    expect(view.title()).not.toBeNull();
    expect(view.monthDropdown()).toBeNull();
  });

  it('a backdrop click closes the touchUi dialog and returns focus to the field', async () => {
    const view = await renderTouch((host) => host.touchUi.set(true));

    await view.openPanel();
    view.backdrop()!.click();
    await view.fixture.whenStable();

    expect(view.host.open()).toBe(false);
    expect(view.dialog()).toBeNull();
    expect(document.activeElement).toBe(view.native);
    expect(view.host.value()).toBe('2026-04-15');
  });

  it('picking a day in the touchUi dialog sets the value and closes', async () => {
    const view = await renderTouch((host) => host.touchUi.set(true));

    await view.openPanel();
    document.querySelector<HTMLButtonElement>('[data-iso="2026-04-20"] button')!.click();
    await view.fixture.whenStable();

    expect(view.host.value()).toBe('2026-04-20');
    expect(view.dialog()).toBeNull();
    expect(view.backdrop()).toBeNull();
  });
});
