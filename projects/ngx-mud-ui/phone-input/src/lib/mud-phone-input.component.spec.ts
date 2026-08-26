import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudPhoneInput } from './mud-phone-input.component';
import type { MudPhoneInputChange } from './mud-phone-input.component';

@Component({
  imports: [MudPhoneInput],
  template: `
    <mud-phone-input
      label="Telefon"
      [(value)]="value"
      [(country)]="country"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [required]="required()"
      [invalid]="invalid()"
      [clearable]="clearable()"
      (changed)="changes.push($event)"
    />
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
});

@Component({
  imports: [MudPhoneInput, ReactiveFormsModule],
  template: `<mud-phone-input label="Telefon" [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl('+37362123456', { nonNullable: true });
}

@Component({
  imports: [MudPhoneInput, FormField],
  template: `<mud-phone-input label="Telefon" [formField]="form.phone" />`,
})
class SignalHost {
  readonly model = signal({ phone: '' });
  readonly form = form(this.model);
}
