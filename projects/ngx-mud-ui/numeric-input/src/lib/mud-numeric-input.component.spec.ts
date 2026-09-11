import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudNumericInput } from './mud-numeric-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import type { MudNumericInputErrorKind, MudNumericInputStep } from './mud-numeric-input.component';

@Component({
  imports: [MudNumericInput, MudLabel, MudInlineMessage],
  template: `
    <mud-numeric-input
      [(value)]="value"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [precision]="precision()"
      [locale]="locale()"
      [allowDecimal]="allowDecimal()"
      [allowNegative]="allowNegative()"
      [showSteppers]="showSteppers()"
      [clearable]="clearable()"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [maxLength]="maxLength()"
      [showCounter]="showCounter()"
      (stepped)="steps.push($event)"
      (errored)="errorKinds.push($event)"
    >
      @if (withLabel()) {
        <mud-label>Suma</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Introduceți suma în MDL.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Suma este obligatorie.</mud-inline-message>
      }
    </mud-numeric-input>
  `,
})
class Host {
  readonly value = signal<number | null>(null);
  readonly min = signal<number | undefined>(undefined);
  readonly max = signal<number | undefined>(undefined);
  readonly step = signal(1);
  readonly precision = signal<number | undefined>(undefined);
  readonly locale = signal<string | undefined>(undefined);
  readonly allowDecimal = signal(true);
  readonly allowNegative = signal(true);
  readonly showSteppers = signal(false);
  readonly clearable = signal(false);
  readonly disabled = signal(false);
  readonly invalid = signal(false);
  readonly maxLength = signal<number | undefined>(undefined);
  readonly showCounter = signal(true);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
  readonly steps: MudNumericInputStep[] = [];
  readonly errorKinds: MudNumericInputErrorKind[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-numeric-input') as HTMLElement;
  const native = el.querySelector('input') as HTMLInputElement;

  return { fixture, host: fixture.componentInstance, el, native };
}

async function type(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement, text: string) {
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

async function blur(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement) {
  native.dispatchEvent(new FocusEvent('focus'));
  native.dispatchEvent(new FocusEvent('blur'));
  await fixture.whenStable();
}

describe('MudNumericInput', () => {
  it('renders a text input exposed as a spinbutton with value bounds', async () => {
    const { fixture, host, native } = await render();

    expect(native.type).toBe('text');
    expect(native.getAttribute('role')).toBe('spinbutton');
    expect(native.getAttribute('inputmode')).toBe('decimal');

    host.min.set(0);
    host.max.set(100);
    host.value.set(42);
    await fixture.whenStable();

    expect(native.getAttribute('aria-valuenow')).toBe('42');
    expect(native.getAttribute('aria-valuemin')).toBe('0');
    expect(native.getAttribute('aria-valuemax')).toBe('100');
    expect(native.value).toBe('42');
  });

  it('parses typed input live and commits with clamping + precision on blur', async () => {
    const { fixture, host, native } = await render();

    host.min.set(0);
    host.max.set(100);
    host.precision.set(2);
    await fixture.whenStable();

    native.dispatchEvent(new FocusEvent('focus'));
    await type(fixture, native, '123.456');
    expect(host.value()).toBe(123.456);
    expect(host.errorKinds).toContain('out-of-range');

    await blur(fixture, native);
    expect(host.value()).toBe(100);
    expect(native.value).toBe('100.00');
  });

  it('emits not-a-number and restores the display for garbage input', async () => {
    const { fixture, host, native } = await render();

    host.value.set(5);
    await fixture.whenStable();

    native.dispatchEvent(new FocusEvent('focus'));
    await type(fixture, native, 'abc');
    await blur(fixture, native);

    expect(host.errorKinds).toContain('not-a-number');
    expect(native.value).toBe('5');
    expect(host.value()).toBe(5);
  });

  it('formats and parses with a locale (ro uses dot groups and comma decimals)', async () => {
    const { fixture, host, native } = await render();

    host.locale.set('ro');
    host.precision.set(2);
    host.value.set(1250.5);
    await fixture.whenStable();

    expect(native.value).toBe('1.250,50');

    native.dispatchEvent(new FocusEvent('focus'));
    await type(fixture, native, '2.500,25');
    expect(host.value()).toBe(2500.25);
  });

  it('steps with the buttons and arrow keys, clamping at the bounds', async () => {
    const { fixture, host, el, native } = await render();

    host.showSteppers.set(true);
    host.min.set(0);
    host.max.set(3);
    host.step.set(2);
    await fixture.whenStable();

    const [up, down] = Array.from(el.querySelectorAll('.numeric-field__stepper')) as HTMLButtonElement[];

    up.click();
    await fixture.whenStable();
    expect(host.value()).toBe(2);

    up.click();
    await fixture.whenStable();
    expect(host.value()).toBe(3);
    expect(up.disabled).toBe(true);
    expect(host.steps.map((s) => s.direction)).toEqual([1, 1]);

    native.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(host.value()).toBe(1);

    native.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(host.value()).toBe(0);
    expect(down.disabled).toBe(true);
  });

  it('blocks decimal and minus entry per allowDecimal/allowNegative', async () => {
    const { fixture, host, native } = await render();

    host.allowDecimal.set(false);
    host.allowNegative.set(false);
    await fixture.whenStable();

    expect(native.getAttribute('inputmode')).toBe('numeric');

    const dot = new KeyboardEvent('keydown', { key: '.', bubbles: true, cancelable: true });
    const minus = new KeyboardEvent('keydown', { key: '-', bubbles: true, cancelable: true });

    native.dispatchEvent(dot);
    native.dispatchEvent(minus);
    expect(dot.defaultPrevented).toBe(true);
    expect(minus.defaultPrevented).toBe(true);

    // A pasted decimal/negative still truncates and clamps at commit.
    native.dispatchEvent(new FocusEvent('focus'));
    await type(fixture, native, '-7.9');
    await blur(fixture, native);
    expect(host.value()).toBe(0);
  });

  it('clears to null and refocuses', async () => {
    const { fixture, host, el, native } = await render();

    host.clearable.set(true);
    host.value.set(9);
    await fixture.whenStable();

    (el.querySelector('.input-field__clear') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(host.value()).toBe(null);
    expect(native.value).toBe('');
    expect(document.activeElement).toBe(native);
  });

  it('projects a leading icon into the icon-start affix, separate from the prefix', async () => {
    const fixture = TestBed.createComponent(IconHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-numeric-input') as HTMLElement;
    const iconAffix = el.querySelector('.input-field__affix--start')!;
    const prefix = el.querySelector('.numeric-field__affix--prefix')!;

    expect(iconAffix.querySelector('svg')).toBeTruthy();
    expect(prefix.textContent).toContain('MDL');
    // Icon box precedes the prefix text (official slot order: icon → prefix → value).
    expect(iconAffix.nextElementSibling).toBe(prefix);
  });

  it('works as a reactive form control with number values', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.value).toBe('10');

    native.dispatchEvent(new FocusEvent('focus'));
    await type(fixture, native, '25');
    expect(host.control.value).toBe(25);

    host.control.setValue(7);
    await fixture.whenStable();
    expect(native.value).toBe('7');

    host.control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
  });

  it('binds signal forms through [formField]', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    native.dispatchEvent(new FocusEvent('focus'));
    await type(fixture, native, '150');
    expect(host.model().amount).toBe(150);

    host.model.set({ amount: 30 });
    await fixture.whenStable();
    expect(native.value).toBe('30');
  });

  it('renders the projected mud-label inside the field label element', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(label.textContent).toContain('Suma');
    expect(label.htmlFor).toBe(native.id);
    expect(native.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('renders no label element without a projected mud-label; ariaLabel takes over', async () => {
    const fixture = TestBed.createComponent(UnlabelledHost);

    await fixture.whenStable();
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(fixture.nativeElement.querySelector('.input-field__label')).toBeNull();
    expect(native.getAttribute('aria-label')).toBe('Suma');
    expect(native.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders no footer and no describedby when nothing is projected and no counter shows', async () => {
    const { fixture, host, el, native } = await render();

    host.showCounter.set(false);
    await fixture.whenStable();

    expect(el.querySelector('.input-field__footer')).toBeNull();
    expect(el.querySelector('.input-field__assistive')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toBeNull();
  });

  it('helper swaps for error in the shared wrapper, with role=alert and describedby wiring', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const helper = el.querySelector('.input-field__assistive')!;

    expect(helper.textContent).toContain('Introduceți suma');
    expect(native.getAttribute('aria-describedby')).toContain(helper.id);

    host.showHelper.set(false);
    host.invalid.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const error = el.querySelector('.input-field__assistive')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toContain('obligatorie');
    expect(el.textContent).not.toContain('Introduceți suma');
    expect(el.classList.contains('input-field--destructive')).toBe(true);
    expect(native.getAttribute('aria-invalid')).toBe('true');
  });

  it('can show two messages at once, in template order', async () => {
    const { fixture, host, el } = await render();

    host.showHelper.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const messages = el.querySelectorAll('.input-field__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Introduceți suma');
    expect(messages[1].textContent).toContain('obligatorie');
  });

  it('includes both the assistive message and the counter in aria-describedby', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    host.maxLength.set(100);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;
    const counter = el.querySelector('.input-field__counter') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${wrapper.id} ${counter.id}`);
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.getAttribute('aria-describedby')).toBe('extra-id');

    fixture.componentInstance.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
  });
});

@Component({
  imports: [MudNumericInput],
  template: `
    <mud-numeric-input>
      <svg icon-start viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" /></svg>
      <span prefix>MDL</span>
    </mud-numeric-input>
  `,
})
class IconHost {}

@Component({
  imports: [MudNumericInput, ReactiveFormsModule],
  template: `<mud-numeric-input [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl<number | null>(10);
}

@Component({
  imports: [MudNumericInput, FormField],
  template: `<mud-numeric-input [formField]="form.amount" />`,
})
class SignalHost {
  readonly model = signal({ amount: null as number | null });
  readonly form = form(this.model);
}

@Component({
  imports: [MudNumericInput],
  template: `<mud-numeric-input aria-label="Suma" />`,
})
class UnlabelledHost {}

@Component({
  imports: [MudNumericInput, MudInlineMessage],
  template: `
    <mud-numeric-input aria-describedby="extra-id" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Introduceți suma în MDL.</mud-inline-message>
      }
    </mud-numeric-input>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly value = signal<number | null>(null);
  readonly showMessage = signal(false);
}
