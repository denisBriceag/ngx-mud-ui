import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudPhoneInput } from './mud-phone-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';
import type { MudPhoneInputChange } from './mud-phone-input.component';

@Component({
  imports: [MudPhoneInput, MudLabel, MudInlineMessage],
  template: `
    <mud-phone-input
      [(value)]="value"
      [(country)]="country"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [required]="required()"
      [invalid]="invalid()"
      [clearable]="clearable()"
      (changed)="changes.push($event)"
    >
      @if (withLabel()) {
        <mud-label>Telefon</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Format: XXX XX XXX.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Număr invalid.</mud-inline-message>
      }
    </mud-phone-input>
  `,
})
class Host {
  readonly value = signal('');
  readonly country = signal('MD');
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly required = signal(false);
  readonly invalid = signal(false);
  readonly clearable = signal(false);
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
  readonly changes: MudPhoneInputChange[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-phone-input') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    native: () => el.querySelector('.phone-field__native') as HTMLInputElement,
    flag: () => el.querySelector('.phone-field__flag') as HTMLImageElement | null,
    dialCode: () => el.querySelector('.phone-field__dial-code') as HTMLElement | null,
    clear: () => el.querySelector('.phone-field__clear') as HTMLButtonElement | null,
  };
}

/** Types into the field the way a browser would: raw text plus a caret. */
async function type(
  fixture: { whenStable(): Promise<unknown> },
  native: HTMLInputElement,
  raw: string,
  caret = raw.length,
) {
  native.value = raw;
  native.setSelectionRange(caret, caret);
  native.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

describe('MudPhoneInput local mode', () => {
  it('renders the label and a static dial-code pill for the country', async () => {
    const { el, flag, dialCode } = await render();

    expect(el.textContent).toContain('Telefon');
    expect(dialCode()?.textContent?.trim()).toBe('+373');
    expect(flag()?.getAttribute('src')).toContain('data:image');
    // Decorative: the country name is exposed as text instead.
    expect(flag()?.getAttribute('alt')).toBe('');
    expect(el.textContent).toContain('Moldova');
  });

  it('masks digits as they are typed and defaults the placeholder to the mask', async () => {
    const { fixture, native } = await render();

    expect(native().getAttribute('placeholder')).toBe('XXX XX XXX');
    expect(native().type).toBe('tel');

    await type(fixture, native(), '0');
    expect(native().value).toBe('0');

    await type(fixture, native(), '0621');
    expect(native().value).toBe('062 1');

    await type(fixture, native(), '06212345');
    expect(native().value).toBe('062 12 345');
  });

  it('publishes the E.164 value, and never a bare dial code', async () => {
    const { fixture, host, native } = await render();

    await type(fixture, native(), '62123456');
    expect(host.value()).toBe('+37362123456');

    await type(fixture, native(), '');
    expect(host.value()).toBe('');
  });

  it('clamps typing at the country digit maximum', async () => {
    const { fixture, host, native } = await render();

    await type(fixture, native(), '0621234599999');
    expect(native().value).toBe('062 12 345');
    expect(host.value()).toBe('+37306212345');
  });

  it('keeps the caret on the digit being edited instead of forcing it to the end', async () => {
    const { fixture, native } = await render();

    await type(fixture, native(), '06212345');
    expect(native().value).toBe('062 12 345');

    // Type a 9 at offset 5, i.e. straight after "062 1".
    await type(fixture, native(), '062 192 345', 6);

    expect(native().value).toBe('062 19 234');
    expect(native().selectionStart).toBe(6);
    expect(native().value[native().selectionStart! - 1]).toBe('9');
  });

  it('renders an externally written E.164 value as a masked national segment', async () => {
    const { fixture, host, native } = await render();

    host.value.set('+37379123456');
    await fixture.whenStable();

    expect(native().value).toBe('791 23 456');
  });

  it('infers the country from an externally written E.164 value', async () => {
    const { fixture, host, native, dialCode } = await render();

    host.value.set('+40721234567');
    await fixture.whenStable();

    expect(host.country()).toBe('RO');
    expect(dialCode()?.textContent?.trim()).toBe('+40');
    expect(native().value).toBe('721 234 567');
  });

  it('re-masks and rebuilds the value when the country changes', async () => {
    const { fixture, host, native } = await render();

    await type(fixture, native(), '62123456');
    expect(host.value()).toBe('+37362123456');

    host.country.set('RO');
    await fixture.whenStable();

    // Digits are kept; the mask and dial code follow the new country.
    expect(native().value).toBe('621 234 56');
    expect(host.value()).toBe('+4062123456');
  });

  it('emits changed on commit with the digit-window completeness', async () => {
    const { fixture, host, native } = await render();

    await type(fixture, native(), '6212345');
    native().dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(host.changes).toEqual([{ value: '+3736212345', country: 'MD', complete: false }]);

    await type(fixture, native(), '62123456');
    native().dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();

    expect(host.changes[1]).toEqual({ value: '+37362123456', country: 'MD', complete: true });
  });

  it('falls back to Moldova and warns when given an unknown country', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, host, dialCode } = await render();

    host.country.set('ZZ');
    await fixture.whenStable();

    expect(dialCode()?.textContent?.trim()).toBe('+373');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('shows the clear button only when opted in and non-empty, and clears through it', async () => {
    const { fixture, host, native, clear } = await render();

    await type(fixture, native(), '62123456');
    expect(clear()).toBeNull();

    host.clearable.set(true);
    await fixture.whenStable();
    expect(clear()).not.toBeNull();

    clear()!.click();
    await fixture.whenStable();

    expect(host.value()).toBe('');
    expect(native().value).toBe('');
    expect(document.activeElement).toBe(native());

    // Empty again, so the button retires.
    expect(clear()).toBeNull();
  });

  it('ignores typing while readonly or disabled', async () => {
    const { fixture, host, native } = await render();

    host.readonly.set(true);
    await fixture.whenStable();
    expect(native().readOnly).toBe(true);

    host.readonly.set(false);
    host.disabled.set(true);
    await fixture.whenStable();

    expect(native().disabled).toBe(true);
    expect(host.value()).toBe('');
  });

  it('wires required and invalid onto the native control', async () => {
    const { fixture, host, el, native } = await render();

    host.required.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    expect(native().required).toBe(true);
    expect(native().getAttribute('aria-invalid')).toBe('true');
    expect(el.classList.contains('is-invalid')).toBe(true);
  });

  it('renders on the server without touching the caret API', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const { fixture, host, native, dialCode } = await render();

    host.value.set('+37362123456');
    await fixture.whenStable();

    // Server-rendered markup must be complete for hydration to replay from it.
    expect(dialCode()?.textContent?.trim()).toBe('+373');
    expect(native().value).toBe('621 23 456');

    fixture.debugElement.children[0].componentInstance.focus();
    expect(document.activeElement).toBe(document.body);
  });

  it('works as a reactive form control', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('.phone-field__native') as HTMLInputElement;

    expect(native.value).toBe('621 23 456');

    await type(fixture, native, '79123456');
    expect(host.control.value).toBe('+37379123456');

    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);

    host.control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
  });

  it('binds signal forms through [formField]', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('.phone-field__native') as HTMLInputElement;

    await type(fixture, native, '62123456');
    expect(host.model().phone).toBe('+37362123456');

    host.model.set({ phone: '+37379123456' });
    await fixture.whenStable();
    expect(native.value).toBe('791 23 456');
  });

  it('renders the projected mud-label inside the field label element', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.input-field__label') as HTMLLabelElement;

    expect(label.textContent).toContain('Telefon');
    expect(label.htmlFor).toBe(native().id);
  });

  it('renders no label element without a projected mud-label', async () => {
    const { fixture, host, el } = await render();

    host.withLabel.set(false);
    await fixture.whenStable();

    expect(el.querySelector('.input-field__label')).toBeNull();
  });

  it('renders no assistive wrapper and no describedby when nothing is projected', async () => {
    const { el, native } = await render();

    expect(el.querySelector('.input-field__assistive')).toBeNull();
    expect(native().getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby on the tel input', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.input-field__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain('Format: XXX XX XXX.');
    expect(native().getAttribute('aria-describedby')).toBe(wrapper.id);
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

    expect(wrapper.textContent).toContain('Număr invalid.');
    expect(wrapper.textContent).not.toContain('Format: XXX XX XXX.');
    expect(el.classList.contains('input-field--destructive')).toBe(true);
  });

  it('can show two messages at once, in template order', async () => {
    const { fixture, host, el } = await render();

    host.showHelper.set(true);
    host.showError.set(true);
    await fixture.whenStable();

    const messages = el.querySelectorAll('.input-field__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Format: XXX XX XXX.');
    expect(messages[1].textContent).toContain('Număr invalid.');
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('.phone-field__native') as HTMLInputElement;

    expect(native.getAttribute('aria-describedby')).toBe('extra-id');

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.input-field__assistive') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
  });
});

@Component({
  imports: [MudPhoneInput, ReactiveFormsModule, MudLabel],
  template: `
    <mud-phone-input [formControl]="control">
      <mud-label>Telefon</mud-label>
    </mud-phone-input>
  `,
})
class ReactiveHost {
  readonly control = new FormControl('+37362123456', { nonNullable: true });
}

@Component({
  imports: [MudPhoneInput, FormField, MudLabel],
  template: `
    <mud-phone-input [formField]="form.phone">
      <mud-label>Telefon</mud-label>
    </mud-phone-input>
  `,
})
class SignalHost {
  readonly model = signal({ phone: '' });
  readonly form = form(this.model);
}

@Component({
  imports: [MudPhoneInput, MudInlineMessage],
  template: `
    <mud-phone-input aria-describedby="extra-id" [(value)]="value">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Format: XXX XX XXX.</mud-inline-message>
      }
    </mud-phone-input>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly value = signal('');
  readonly showMessage = signal(false);
}
