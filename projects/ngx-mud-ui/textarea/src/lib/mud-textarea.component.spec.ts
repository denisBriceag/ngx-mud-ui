import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudTextarea } from './mud-textarea.component';
import { MudFieldError, MudFieldHelper, MudFieldLabel } from 'ngx-mud-ui/text-input';
import { MudInlineMessage } from '../../../inline-message/src/public-api';

@Component({
  imports: [MudTextarea],
  template: `
    <mud-textarea
      label="Mesaj"
      [(value)]="value"
      [invalid]="invalid()"
      [errorText]="errorText()"
      [helperText]="helperText()"
      [maxLength]="maxLength()"
      [showCounter]="showCounter()"
      [resize]="resize()"
      [rows]="6"
      [disabled]="disabled()"
    />
  `,
})
class Host {
  readonly value = signal('');
  readonly invalid = signal(false);
  readonly errorText = signal<string | undefined>(undefined);
  readonly helperText = signal<string | undefined>(undefined);
  readonly maxLength = signal<number | undefined>(undefined);
  readonly showCounter = signal(true);
  readonly resize = signal<'vertical' | 'none'>('vertical');
  readonly disabled = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-textarea') as HTMLElement;
  const native = el.querySelector('textarea') as HTMLTextAreaElement;

  return { fixture, host: fixture.componentInstance, el, native };
}

async function type(fixture: { whenStable(): Promise<unknown> }, native: HTMLTextAreaElement, text: string) {
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

describe('MudTextarea', () => {
  it('renders the shared field anatomy with a native textarea', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(el.classList.contains('input-field')).toBe(true);
    expect(el.querySelector('.input-field__control--textarea')).toBeTruthy();
    expect(native.rows).toBe(6);
    expect(label.htmlFor).toBe(native.id);
    expect(native.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('two-way binds value and shows the counter while maxLength is set', async () => {
    const { fixture, host, el, native } = await render();

    expect(el.querySelector('.input-field__counter')).toBeNull();

    host.maxLength.set(100);
    await fixture.whenStable();

    const counter = el.querySelector('.input-field__counter')!;

    expect(counter.textContent).toContain('0 / 100');
    expect(native.maxLength).toBe(100);
    // The counter is announced via the accessible description, not hidden.
    expect(counter.getAttribute('aria-hidden')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toContain(counter.id);
    // Without a consumer-provided counterLabel the digits are announced as-is.
    expect(counter.getAttribute('aria-label')).toBeNull();
    expect(counter.querySelector('.input-field__sr-only')).toBeNull();

    await type(fixture, native, 'salut');
    expect(host.value()).toBe('salut');
    expect(el.querySelector('.input-field__counter')?.textContent).toContain('5 / 100');

    host.showCounter.set(false);
    await fixture.whenStable();
    expect(el.querySelector('.input-field__counter')).toBeNull();
  });

  it('error replaces helper in the footer, with role=alert and describedby wiring', async () => {
    const { fixture, host, el, native } = await render();

    host.helperText.set('Maxim 500 de caractere.');
    await fixture.whenStable();

    const helper = el.querySelector('.input-field__assistive')!;

    expect(helper.textContent).toContain('Maxim 500');
    expect(native.getAttribute('aria-describedby')).toContain(helper.id);

    host.invalid.set(true);
    host.errorText.set('Mesajul este obligatoriu.');
    await fixture.whenStable();

    const error = el.querySelector('.input-field__assistive')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toContain('obligatoriu');
    expect(el.textContent).not.toContain('Maxim 500');
    expect(el.classList.contains('input-field--destructive')).toBe(true);
    expect(native.getAttribute('aria-invalid')).toBe('true');
  });

  it('renders a consumer-provided counterLabel as the announced sr-only text', async () => {
    const fixture = TestBed.createComponent(CounterLabelHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-textarea') as HTMLElement;
    const counter = el.querySelector('.input-field__counter')!;

    // aria-label stays prohibited on generic spans (axe aria-prohibited-attr);
    // the consumer's sentence lives in visually-hidden content, digits are
    // hidden from AT.
    expect(counter.querySelector('.input-field__sr-only')?.textContent).toBe('2 din 100 de caractere');
    expect(counter.querySelector('[aria-hidden="true"]')?.textContent).toContain('2 / 100');
  });

  it('maps resize none to the modifier class', async () => {
    const { fixture, host, el } = await render();

    expect(el.classList.contains('input-field--no-resize')).toBe(false);

    host.resize.set('none');
    await fixture.whenStable();
    expect(el.classList.contains('input-field--no-resize')).toBe(true);
  });

  it('works as a reactive form control with touched-on-blur and disabling', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-textarea') as HTMLElement;
    const native = el.querySelector('textarea') as HTMLTextAreaElement;

    expect(native.value).toBe('seed');

    await type(fixture, native, 'typed');
    expect(host.control.value).toBe('typed');

    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);

    host.control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
    expect(el.classList.contains('is-disabled')).toBe(true);
  });

  it('binds signal forms through [formField], surfacing validator errors', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-textarea') as HTMLElement;
    const native = el.querySelector('textarea') as HTMLTextAreaElement;

    await type(fixture, native, 'un mesaj');
    expect(host.model().message).toBe('un mesaj');

    await type(fixture, native, '');
    await fixture.whenStable();

    expect(host.form.message().invalid()).toBe(true);
    expect(el.classList.contains('input-field--destructive')).toBe(true);
    expect(el.querySelector('.inline-message--error')?.textContent).toContain('Mesajul este obligatoriu');
  });

  it('projected error content renders inside the announced wrapper', async () => {
    const fixture = TestBed.createComponent(SlottedHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-textarea') as HTMLElement;
    const error = el.querySelector('.input-field__assistive')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.querySelector('mud-inline-message.custom-error')).toBeTruthy();
  });
});

@Component({
  imports: [MudTextarea],
  template: `
    <mud-textarea
      label="Mesaj"
      [(value)]="value"
      [maxLength]="100"
      [counterLabel]="value().length + ' din 100 de caractere'"
    />
  `,
})
class CounterLabelHost {
  readonly value = signal('ab');
}

@Component({
  imports: [MudTextarea, ReactiveFormsModule],
  template: `<mud-textarea label="Mesaj" [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl('seed', { nonNullable: true });
}

@Component({
  imports: [MudTextarea, FormField],
  template: `<mud-textarea label="Mesaj" [formField]="form.message" />`,
})
class SignalHost {
  readonly model = signal({ message: '' });
  readonly form = form(this.model, (path) => {
    required(path.message, { message: 'Mesajul este obligatoriu.' });
  });
}

@Component({
  imports: [MudTextarea, MudFieldLabel, MudFieldHelper, MudFieldError, MudInlineMessage],
  template: `
    <mud-textarea invalid>
      <span mudLabel>Mesaj</span>
      <mud-inline-message mudError class="custom-error" variant="error">Eroare proiectată.</mud-inline-message>
    </mud-textarea>
  `,
})
class SlottedHost {}
