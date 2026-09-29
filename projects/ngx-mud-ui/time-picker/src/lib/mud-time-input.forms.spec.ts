import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudTimeInput } from './mud-time-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';

@Component({
  imports: [MudTimeInput, ReactiveFormsModule],
  template: `<mud-time-input [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl<string | null>(null, Validators.required);
}

@Component({
  imports: [MudTimeInput, FormField, MudLabel, MudInlineMessage],
  template: `
    <mud-time-input [formField]="form.start">
      <mud-label>Start</mud-label>
      @if (form.start().invalid()) {
        <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
      }
    </mud-time-input>
  `,
})
class TimeSignalHost {
  readonly model = signal<{ start: string | null }>({ start: null });

  readonly form = form(this.model, (path) => {
    required(path.start, { message: 'Alegeți o oră.' });
  });
}

async function type(fixture: { whenStable(): Promise<unknown> }, native: HTMLInputElement, text: string) {
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true }));
  await fixture.whenStable();
}

describe('MudTimeInput reactive forms (ControlValueAccessor)', () => {
  it('writes typed times into the control and reflects control writes', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();

    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const control = fixture.componentInstance.control;

    await type(fixture, native, '09:30');
    expect(control.value).toBe('09:30');

    await type(fixture, native, '09:3');
    expect(control.value).toBeNull();

    control.setValue('14:00');
    await fixture.whenStable();
    expect(native.getAttribute('value')).toBe('14:00');
  });

  it('marks touched on blur and honours setDisabledState', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();

    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const control = fixture.componentInstance.control;

    expect(control.touched).toBe(false);

    native.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await fixture.whenStable();
    expect(control.touched).toBe(true);

    control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('mud-time-input').classList).toContain('is-disabled');

    control.enable();
    await fixture.whenStable();
    expect(native.disabled).toBe(false);
  });

  it('discards the revert history on a control reset even when the value is already null', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();

    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const control = fixture.componentInstance.control;

    await type(fixture, native, '09:30');
    // Mid-edit: the entry is incomplete, the control already null, and the
    // revert history holds 09:30.
    await type(fixture, native, '09:3');
    expect(control.value).toBeNull();

    control.reset();
    await fixture.whenStable();

    native.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await fixture.whenStable();

    expect(control.value).toBeNull();
    expect(native.getAttribute('value')).toBe('');
  });
});

describe('MudTimeInput signal forms (FormValueControl)', () => {
  it('binds value both ways through the Field directive, and marks touch on blur', async () => {
    const fixture = TestBed.createComponent(TimeSignalHost);

    await fixture.whenStable();

    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(host.form.start().touched()).toBe(false);

    await type(fixture, native, '09:30');
    expect(host.model().start).toBe('09:30');
    expect(host.form.start().value()).toBe('09:30');

    native.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    await fixture.whenStable();
    expect(host.form.start().touched()).toBe(true);

    host.model.set({ start: '16:45' });
    await fixture.whenStable();
    expect(native.getAttribute('value')).toBe('16:45');
  });

  it('surfaces the required-validator invalid state; the consumer projects the message', async () => {
    const fixture = TestBed.createComponent(TimeSignalHost);

    await fixture.whenStable();

    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const el = fixture.nativeElement.querySelector('mud-time-input') as HTMLElement;

    expect(native.getAttribute('aria-invalid')).toBe('true');
    expect(el.classList).toContain('is-invalid');
    expect(el.classList).toContain('input-field--destructive');
    expect(el.querySelector('.input-field__assistive')!.textContent).toContain('Alegeți o oră.');
    expect(el.querySelector('.input-field__assistive')!.getAttribute('role')).toBe('alert');

    fixture.componentInstance.model.set({ start: '09:30' });
    await fixture.whenStable();

    expect(native.getAttribute('aria-invalid')).toBeNull();
    expect(el.querySelector('.input-field__assistive')).toBeNull();
  });
});
