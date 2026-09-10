import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudCheckbox } from './mud-checkbox.component';
import { MudFieldError, MudFieldLabel } from 'ngx-mud-ui/text-input';
import { MudInlineMessage } from '../../../inline-message/src/public-api';

@Component({
  imports: [MudCheckbox],
  template: `
    <mud-checkbox
      label="Accept termenii"
      [(checked)]="checked"
      [indeterminate]="indeterminate()"
      [supportingText]="supportingText()"
      [errorText]="errorText()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [required]="requiredField()"
      [size]="size()"
    />
  `,
})
class Host {
  readonly checked = signal(false);
  readonly indeterminate = signal(false);
  readonly supportingText = signal<string | undefined>(undefined);
  readonly errorText = signal<string | undefined>(undefined);
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly requiredField = signal(false);
  readonly size = signal<'medium' | 'small'>('medium');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-checkbox') as HTMLElement;
  const native = el.querySelector('input[type="checkbox"]') as HTMLInputElement;

  return { fixture, host: fixture.componentInstance, el, native };
}

describe('MudCheckbox', () => {
  it('renders a native checkbox with the label association', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.selection-control__label') as HTMLLabelElement;

    expect(el.classList.contains('selection-control')).toBe(true);
    expect(native).toBeTruthy();
    expect(label.htmlFor).toBe(native.id);
    expect(label.textContent).toContain('Accept termenii');
  });

  it('toggles the two-way model on user activation and blocks it while readonly', async () => {
    const { fixture, host, native } = await render();

    native.click();
    await fixture.whenStable();
    expect(host.checked()).toBe(true);

    host.readonly.set(true);
    await fixture.whenStable();
    native.click();
    await fixture.whenStable();
    expect(host.checked()).toBe(true);
  });

  it('mirrors indeterminate onto the native DOM property and shows the dash', async () => {
    const { fixture, host, el, native } = await render();

    host.indeterminate.set(true);
    await fixture.whenStable();

    expect(native.indeterminate).toBe(true);
    expect(el.classList.contains('is-indeterminate')).toBe(true);

    // Consumer-owned: toggling does not clear the input's state.
    native.click();
    await fixture.whenStable();
    expect(host.checked()).toBe(true);
    expect(el.classList.contains('is-indeterminate')).toBe(true);
  });

  it('wires supporting text and error via aria-describedby; error replaces supporting', async () => {
    const { fixture, host, el, native } = await render();

    host.supportingText.set('Se aplică termenii MPay.');
    await fixture.whenStable();

    const supporting = el.querySelector('.selection-control__supporting')!;

    expect(native.getAttribute('aria-describedby')).toContain(supporting.id);

    host.invalid.set(true);
    host.errorText.set('Trebuie să acceptați termenii.');
    await fixture.whenStable();

    const error = el.querySelector('.selection-control__error')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toContain('Trebuie să acceptați');
    expect(el.querySelector('.selection-control__supporting')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toContain(error.id);
    expect(native.getAttribute('aria-invalid')).toBe('true');
    expect(el.classList.contains('is-invalid')).toBe(true);
  });

  it('maps size small and required to their affordances', async () => {
    const { fixture, host, el, native } = await render();

    host.size.set('small');
    host.requiredField.set(true);
    await fixture.whenStable();

    expect(el.classList.contains('selection-control--sm')).toBe(true);
    expect(el.querySelector('.selection-control__required')).toBeTruthy();
    expect(native.required).toBe(true);
  });

  it('works as a reactive form control (boolean CVA)', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.checked).toBe(true);

    native.click();
    await fixture.whenStable();
    expect(host.control.value).toBe(false);

    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.control.touched).toBe(true);

    host.control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
  });

  it('binds signal forms through [formField] via the checked contract', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.checked).toBe(false);

    native.click();
    await fixture.whenStable();
    expect(host.model().subscribed).toBe(true);

    host.model.set({ subscribed: false });
    await fixture.whenStable();
    expect(native.checked).toBe(false);
  });

  it('projected label and error content render inside the wired regions', async () => {
    const fixture = TestBed.createComponent(SlottedHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-checkbox') as HTMLElement;

    expect(el.querySelector('.selection-control__label .custom-label')).toBeTruthy();
    expect(el.querySelector('.selection-control__error mud-inline-message')).toBeTruthy();
    expect(el.querySelector('.selection-control__error')!.getAttribute('role')).toBe('alert');
  });
});

@Component({
  imports: [MudCheckbox, ReactiveFormsModule],
  template: `<mud-checkbox label="Termeni" [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl(true, { nonNullable: true, validators: [Validators.requiredTrue] });
}

@Component({
  imports: [MudCheckbox, FormField],
  template: `<mud-checkbox label="Abonare la noutăți" [formField]="form.subscribed" />`,
})
class SignalHost {
  readonly model = signal({ subscribed: false });
  readonly form = form(this.model);
}

@Component({
  imports: [MudCheckbox, MudFieldLabel, MudFieldError, MudInlineMessage],
  template: `
    <mud-checkbox invalid>
      <span mudLabel class="custom-label">Accept <a href="/termeni">termenii</a></span>
      <mud-inline-message mudError variant="error" size="small" hideIcon>Obligatoriu.</mud-inline-message>
    </mud-checkbox>
  `,
})
class SlottedHost {}
