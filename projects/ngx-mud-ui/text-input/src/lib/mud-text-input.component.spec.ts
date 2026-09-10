import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudTextInput } from './mud-text-input.component';
import { MudFieldError, MudFieldHelper, MudFieldLabel } from './mud-field-slots';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import type { MudTextInputSize, MudTextInputVariant } from './mud-text-input.component';

@Component({
  imports: [MudTextInput],
  template: `
    <mud-text-input
      [label]="label()"
      [variant]="variant()"
      [size]="size()"
      [(value)]="value"
      [helperText]="helperText()"
      [errorText]="errorText()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [loading]="loading()"
      [clearable]="clearable()"
      [required]="requiredField()"
      placeholder="Type here"
    />
  `,
})
class Host {
  readonly value = signal('');
  readonly label = signal<string | undefined>('IDNP');
  readonly variant = signal<MudTextInputVariant>('default');
  readonly size = signal<MudTextInputSize>('medium');
  readonly helperText = signal<string | undefined>(undefined);
  readonly errorText = signal<string | undefined>(undefined);
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly loading = signal(false);
  readonly clearable = signal(false);
  readonly requiredField = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-text-input') as HTMLElement;
  const native = el.querySelector('input.input-field__native') as HTMLInputElement;

  return { fixture, host: fixture.componentInstance, el, native };
}

async function type(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement, text: string) {
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

describe('MudTextInput', () => {
  it('renders label, control, and native input with the ARIA wiring', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(el.classList.contains('input-field')).toBe(true);
    expect(label.textContent).toContain('IDNP');
    expect(label.htmlFor).toBe(native.id);
    expect(native.getAttribute('aria-labelledby')).toBe(label.id);
    expect(native.placeholder).toBe('Type here');
  });

  it('two-way binds value and reflects typing to the model', async () => {
    const { fixture, host, native } = await render();

    await type(fixture, native, 'abc');
    expect(host.value()).toBe('abc');

    host.value.set('xyz');
    await fixture.whenStable();
    expect(native.value).toBe('xyz');
  });

  it('maps variants and sizes to classes; invalid forces destructive', async () => {
    const { fixture, host, el } = await render();

    host.variant.set('success');
    host.size.set('large');
    await fixture.whenStable();
    expect(el.classList.contains('input-field--success')).toBe(true);
    expect(el.classList.contains('input-field--lg')).toBe(true);

    host.invalid.set(true);
    await fixture.whenStable();
    expect(el.classList.contains('input-field--destructive')).toBe(true);
    expect(el.classList.contains('is-invalid')).toBe(true);
  });

  it('shows helper text, replaced by the error message when invalid, with aria-describedby', async () => {
    const { fixture, host, el, native } = await render();

    host.helperText.set('13 digits');
    await fixture.whenStable();

    const helper = el.querySelector('.input-field__assistive')!;

    expect(helper.textContent).toContain('13 digits');
    expect(helper.querySelector('.inline-message')).toBeTruthy();
    expect(native.getAttribute('aria-describedby')).toBe(helper.id);

    host.invalid.set(true);
    host.errorText.set('Invalid IDNP');
    await fixture.whenStable();

    const error = el.querySelector('.input-field__assistive')!;

    expect(error.textContent).toContain('Invalid IDNP');
    expect(error.querySelector('.inline-message--error')).toBeTruthy();
    expect(error.getAttribute('role')).toBe('alert');
    expect(el.textContent).not.toContain('13 digits');
    expect(native.getAttribute('aria-describedby')).toBe(error.id);
    expect(native.getAttribute('aria-invalid')).toBe('true');
  });

  it('marks required with an asterisk and the native attribute', async () => {
    const { fixture, host, el, native } = await render();

    host.requiredField.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.input-field__required')).toBeTruthy();
    expect(native.required).toBe(true);
  });

  it('clear button appears only with a value, clears, and refocuses the field', async () => {
    const { fixture, host, el, native } = await render();

    host.clearable.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.input-field__clear')).toBeNull();

    await type(fixture, native, 'abc');
    const clear = el.querySelector('.input-field__clear') as HTMLButtonElement;

    expect(clear).toBeTruthy();
    expect(clear.tabIndex).toBe(-1);

    clear.click();
    await fixture.whenStable();
    expect(host.value()).toBe('');
    expect(document.activeElement).toBe(native);
  });

  it('suppresses the clear button when disabled, readonly, or loading', async () => {
    const { fixture, host, el, native } = await render();

    host.clearable.set(true);
    await type(fixture, native, 'abc');
    expect(el.querySelector('.input-field__clear')).toBeTruthy();

    for (const state of [host.disabled, host.readonly, host.loading] as const) {
      state.set(true);
      await fixture.whenStable();
      expect(el.querySelector('.input-field__clear')).toBeNull();
      state.set(false);
    }
  });

  it('loading shows the spinner, aria-busy, and makes the field uninteractive', async () => {
    const { fixture, host, el, native } = await render();

    host.loading.set(true);
    await fixture.whenStable();

    expect(el.getAttribute('aria-busy')).toBe('true');
    expect(el.querySelector('.input-field__spinner')).toBeTruthy();
    expect(native.readOnly).toBe(true);
  });

  it('uses aria-label only when no visible label exists', async () => {
    const fixture = TestBed.createComponent(UnlabelledHost);

    await fixture.whenStable();
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.getAttribute('aria-label')).toBe('Search services');
    expect(native.getAttribute('aria-labelledby')).toBeNull();
  });
});

describe('MudTextInput reactive forms (ControlValueAccessor)', () => {
  it('syncs writeValue, user input, disabling, and touched-on-blur', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-text-input') as HTMLElement;
    const native = el.querySelector('input') as HTMLInputElement;

    expect(native.value).toBe('seed');

    await type(fixture, native, 'typed');
    expect(host.control.value).toBe('typed');

    host.control.setValue('from-control');
    await fixture.whenStable();
    expect(native.value).toBe('from-control');

    expect(host.control.touched).toBe(false);
    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);

    host.control.disable();
    await fixture.whenStable();
    expect(el.classList.contains('is-disabled')).toBe(true);
    expect(native.disabled).toBe(true);
  });

  it('works with validators for the invalid presentation via explicit binding', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    await type(fixture, native, '');
    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(host.control.invalid).toBe(true);
  });
});

describe('MudTextInput signal forms (FormValueControl)', () => {
  it('binds value both ways through the Field directive', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.value).toBe('initial');

    await type(fixture, native, 'edited');
    expect(host.model().idnp).toBe('edited');

    host.model.set({ idnp: 'programmatic' });
    await fixture.whenStable();
    expect(native.value).toBe('programmatic');
  });

  it('surfaces required-validator errors as the destructive error line after touch', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-text-input') as HTMLElement;
    const native = el.querySelector('input') as HTMLInputElement;

    await type(fixture, native, '');
    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(host.form.idnp().invalid()).toBe(true);
    expect(host.form.idnp().touched()).toBe(true);
    expect(el.classList.contains('input-field--destructive')).toBe(true);
    expect(el.querySelector('.inline-message--error')?.textContent).toContain('IDNP is required');
    expect(native.required).toBe(true);
  });
});

@Component({
  imports: [MudTextInput],
  template: `<mud-text-input aria-label="Search services" />`,
})
class UnlabelledHost {}

@Component({
  imports: [MudTextInput, ReactiveFormsModule],
  template: `<mud-text-input label="IDNP" [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl<string>('seed', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  imports: [MudTextInput, FormField],
  template: `<mud-text-input label="IDNP" [formField]="form.idnp" />`,
})
class SignalHost {
  readonly input = viewChild.required(MudTextInput);
  readonly model = signal({ idnp: 'initial' });
  readonly form = form(this.model, (path) => {
    required(path.idnp, { message: 'IDNP is required' });
  });
}

describe('MudTextInput composable slots', () => {
  it('projected label/helper/error replace the defaults inside the wired wrappers', async () => {
    const fixture = TestBed.createComponent(SlottedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-text-input') as HTMLElement;
    const native = el.querySelector('input') as HTMLInputElement;

    // Projected label renders inside the <label> and keeps the for-association.
    const label = el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(label.querySelector('.custom-label')).toBeTruthy();
    expect(label.htmlFor).toBe(native.id);

    // Helper region hosts the projected inline-message and wires describedby.
    const helper = el.querySelector('.input-field__assistive')!;

    expect(helper.querySelector('mud-inline-message.custom-helper')).toBeTruthy();
    expect(native.getAttribute('aria-describedby')).toContain(helper.id);

    // Turning invalid swaps to the error region: projected content inside a
    // component-owned role=alert wrapper, replacing the helper.
    host.invalid.set(true);
    await fixture.whenStable();

    const error = el.querySelector('.input-field__assistive')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.querySelector('mud-inline-message.custom-error')).toBeTruthy();
    expect(el.querySelector('.custom-helper')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toContain(error.id);
    expect(el.classList.contains('input-field--destructive')).toBe(true);
  });

  it('merges external aria-describedby ids with the internal assistive id', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const tokens = (native.getAttribute('aria-describedby') ?? '').split(/\s+/);

    expect(tokens).toContain('external-note');
    expect(tokens.some((token) => token.endsWith('-helper'))).toBe(true);
  });
});

@Component({
  imports: [MudTextInput, MudFieldLabel, MudFieldHelper, MudFieldError, MudInlineMessage],
  template: `
    <mud-text-input [invalid]="invalid()">
      <span mudLabel class="custom-label">IDNP</span>
      <mud-inline-message mudHelper class="custom-helper" hideIcon>13 cifre.</mud-inline-message>
      <mud-inline-message mudError class="custom-error" variant="error">IDNP invalid.</mud-inline-message>
    </mud-text-input>
  `,
})
class SlottedHost {
  readonly invalid = signal(false);
}

@Component({
  imports: [MudTextInput],
  template: `
    <mud-text-input label="IDNP" helperText="13 cifre." aria-describedby="external-note" />
    <p id="external-note">Notă externă.</p>
  `,
})
class ExternalDescribedHost {}
