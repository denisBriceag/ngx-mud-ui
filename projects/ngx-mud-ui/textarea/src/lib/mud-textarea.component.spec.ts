import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudTextarea } from './mud-textarea.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import type { MudTextareaResize } from './mud-textarea.component';

@Component({
  imports: [MudTextarea, MudLabel, MudInlineMessage],
  template: `
    <mud-textarea
      [(value)]="value"
      [invalid]="invalid()"
      [maxLength]="maxLength()"
      [showCounter]="showCounter()"
      [resize]="resize()"
      [rows]="6"
      [disabled]="disabled()"
    >
      @if (withLabel()) {
        <mud-label>Mesaj</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Maxim 500 de caractere.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Mesajul este obligatoriu.</mud-inline-message>
      }
    </mud-textarea>
  `,
})
class Host {
  readonly value = signal('');
  readonly invalid = signal(false);
  readonly maxLength = signal<number | undefined>(undefined);
  readonly showCounter = signal(true);
  readonly resize = signal<MudTextareaResize>('vertical');
  readonly disabled = signal(false);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-textarea') as HTMLElement;
  const native = el.querySelector('textarea.input-field__native') as HTMLTextAreaElement;

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
    expect(label.textContent).toContain('Mesaj');
    expect(label.htmlFor).toBe(native.id);
    expect(native.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('renders no label element without a projected mud-label; ariaLabel takes over', async () => {
    const fixture = TestBed.createComponent(UnlabelledHost);

    await fixture.whenStable();
    const native = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    expect(fixture.nativeElement.querySelector('.input-field__label')).toBeNull();
    expect(native.getAttribute('aria-label')).toBe('Mesaj');
    expect(native.getAttribute('aria-labelledby')).toBeNull();
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

  it('renders no footer and no describedby when nothing is projected and no counter shows', async () => {
    const { el, native } = await render();

    expect(el.querySelector('.input-field__footer')).toBeNull();
    expect(el.querySelector('.input-field__assistive')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toBeNull();
  });

  it('helper swaps for error in the shared wrapper, with role=alert and describedby wiring', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const helper = el.querySelector('.input-field__assistive')!;

    expect(helper.textContent).toContain('Maxim 500');
    expect(native.getAttribute('aria-describedby')).toContain(helper.id);

    host.showHelper.set(false);
    host.invalid.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const error = el.querySelector('.input-field__assistive')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toContain('obligatoriu');
    expect(el.textContent).not.toContain('Maxim 500');
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
    expect(messages[0].textContent).toContain('Maxim 500');
    expect(messages[1].textContent).toContain('obligatoriu');
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
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    expect(native.getAttribute('aria-describedby')).toBe('extra-id');

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
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

  it('binds signal forms through [formField], surfacing validator errors via a consumer-projected message', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-textarea') as HTMLElement;
    const native = el.querySelector('textarea') as HTMLTextAreaElement;

    await type(fixture, native, 'un mesaj');
    expect(host.model().message).toBe('un mesaj');

    await type(fixture, native, '');
    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(host.form.message().invalid()).toBe(true);
    expect(el.classList.contains('input-field--destructive')).toBe(true);
    expect(el.querySelector('.input-field__assistive mud-inline-message')?.textContent).toContain(
      'Mesajul este obligatoriu',
    );
  });
});

@Component({
  imports: [MudTextarea],
  template: `<mud-textarea aria-label="Mesaj" />`,
})
class UnlabelledHost {}

@Component({
  imports: [MudTextarea, MudLabel],
  template: `
    <mud-textarea [(value)]="value" [maxLength]="100" [counterLabel]="value().length + ' din 100 de caractere'">
      <mud-label>Mesaj</mud-label>
    </mud-textarea>
  `,
})
class CounterLabelHost {
  readonly value = signal('ab');
}

@Component({
  imports: [MudTextarea, MudLabel, ReactiveFormsModule],
  template: `
    <mud-textarea [formControl]="control">
      <mud-label>Mesaj</mud-label>
    </mud-textarea>
  `,
})
class ReactiveHost {
  readonly control = new FormControl('seed', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  imports: [MudTextarea, FormField, MudInlineMessage],
  template: `
    <mud-textarea [formField]="form.message">
      @if (form.message().touched() && form.message().invalid()) {
        <mud-inline-message variant="error">Mesajul este obligatoriu.</mud-inline-message>
      }
    </mud-textarea>
  `,
})
class SignalHost {
  readonly model = signal({ message: '' });
  readonly form = form(this.model, (path) => {
    required(path.message, { message: 'Mesajul este obligatoriu.' });
  });
}

@Component({
  imports: [MudTextarea, MudInlineMessage],
  template: `
    <mud-textarea aria-describedby="extra-id" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Maxim 500 de caractere.</mud-inline-message>
      }
    </mud-textarea>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly value = signal('');
  readonly showMessage = signal(false);
}
