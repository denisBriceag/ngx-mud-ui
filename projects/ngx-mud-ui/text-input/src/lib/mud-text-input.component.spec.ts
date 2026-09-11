import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudTextInput } from './mud-text-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import type { MudTextInputSize, MudTextInputVariant } from './mud-text-input.component';

@Component({
  imports: [MudTextInput, MudLabel, MudInlineMessage],
  template: `
    <mud-text-input
      [variant]="variant()"
      [size]="size()"
      [(value)]="value"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [loading]="loading()"
      [clearable]="clearable()"
      [required]="requiredField()"
      placeholder="Type here"
    >
      @if (withLabel()) {
        <mud-label>IDNP</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>13 cifre.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">IDNP invalid.</mud-inline-message>
      }
    </mud-text-input>
  `,
})
class Host {
  readonly value = signal('');
  readonly variant = signal<MudTextInputVariant>('default');
  readonly size = signal<MudTextInputSize>('medium');
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly loading = signal(false);
  readonly clearable = signal(false);
  readonly requiredField = signal(false);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
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
  it('renders control and native input with the placeholder', async () => {
    const { el, native } = await render();

    expect(el.classList.contains('input-field')).toBe(true);
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

  it('renders the projected mud-label inside the field label element', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(label.textContent).toContain('IDNP');
    expect(label.htmlFor).toBe(native.id);
    expect(native.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('renders no label element without a projected mud-label; ariaLabel takes over', async () => {
    const { fixture, host, el, native } = await render();

    host.withLabel.set(false);
    await fixture.whenStable();

    expect(el.querySelector('.input-field__label')).toBeNull();
    expect(native.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders no assistive wrapper and no describedby when nothing is projected', async () => {
    const { el, native } = await render();

    expect(el.querySelector('.input-field__assistive')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain('13 cifre.');
    expect(native.getAttribute('aria-describedby')).toBe(wrapper.id);
  });

  it('lets the consumer swap helper for error — both land in the same wrapper', async () => {
    const { fixture, host, el } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();
    host.showHelper.set(false);
    host.showError.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.textContent).toContain('IDNP invalid.');
    expect(wrapper.textContent).not.toContain('13 cifre.');
    expect(el.classList.contains('input-field--destructive')).toBe(true);
  });

  it('can show two messages at once, in template order', async () => {
    const { fixture, host, el } = await render();

    host.showHelper.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const messages = el.querySelectorAll('.input-field__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('13 cifre.');
    expect(messages[1].textContent).toContain('IDNP invalid.');
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.getAttribute('aria-describedby')).toBe('extra-id');

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
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

  it('surfaces required-validator invalid/touched state without rendering a message itself', async () => {
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
  template: `<mud-text-input [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl<string>('seed', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  imports: [MudTextInput, FormField],
  template: `<mud-text-input [formField]="form.idnp" />`,
})
class SignalHost {
  readonly input = viewChild.required(MudTextInput);
  readonly model = signal({ idnp: 'initial' });
  readonly form = form(this.model, (path) => {
    required(path.idnp, { message: 'IDNP is required' });
  });
}

@Component({
  imports: [MudTextInput, MudInlineMessage],
  template: `
    <mud-text-input aria-describedby="extra-id" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>13 cifre.</mud-inline-message>
      }
    </mud-text-input>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly value = signal('');
  readonly showMessage = signal(false);
}
