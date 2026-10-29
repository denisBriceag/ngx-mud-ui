import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudCheckbox } from '../mud-checkbox.component';
import { MudLabel } from '../../../../label/src/public-api';
import { MudInlineMessage } from '../../../../inline-message/src/public-api';
import type { MudCheckboxSize } from '../mud-checkbox.component';

@Component({
  imports: [MudCheckbox, MudLabel, MudInlineMessage],
  template: `
    <mud-checkbox
      [(checked)]="checked"
      [indeterminate]="indeterminate()"
      [invalid]="invalid()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [required]="requiredField()"
      [size]="size()"
    >
      @if (withLabel()) {
        <mud-label>Accept termenii</mud-label>
      }
      @if (showHelper()) {
        <mud-inline-message hideIcon>Se aplică termenii MPay.</mud-inline-message>
      }
      @if (showError()) {
        <mud-inline-message variant="error">Trebuie să acceptați termenii.</mud-inline-message>
      }
    </mud-checkbox>
  `,
})
class Host {
  readonly checked = signal(false);
  readonly indeterminate = signal(false);
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly requiredField = signal(false);
  readonly size = signal<MudCheckboxSize>('md');
  readonly withLabel = signal(true);
  readonly showHelper = signal(false);
  readonly showError = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-checkbox') as HTMLElement;
  const native = el.querySelector('input[type="checkbox"]') as HTMLInputElement;

  return { fixture, host: fixture.componentInstance, el, native };
}

describe('MudCheckbox', () => {
  it('renders a native checkbox inside the selection-control host', async () => {
    const { el, native } = await render();

    expect(el.classList.contains('selection-control')).toBe(true);
    expect(native).toBeTruthy();
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

  it('maps size small and required to their affordances', async () => {
    const { fixture, host, el, native } = await render();

    host.size.set('sm');
    host.requiredField.set(true);
    await fixture.whenStable();

    expect(el.classList.contains('selection-control--sm')).toBe(true);
    expect(el.querySelector('.selection-control__required')).toBeTruthy();
    expect(native.required).toBe(true);
  });

  it('renders the projected mud-label inside the field label element', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.selection-control__label') as HTMLLabelElement;

    expect(label.textContent).toContain('Accept termenii');
    expect(label.htmlFor).toBe(native.id);
  });

  it('renders no label element without a projected mud-label', async () => {
    const { fixture, host, el } = await render();

    host.withLabel.set(false);
    await fixture.whenStable();

    expect(el.querySelector('.selection-control__label')).toBeNull();
  });

  it('renders no assistive wrapper and no describedby when nothing is projected', async () => {
    const { el, native } = await render();

    expect(el.querySelector('.selection-control__assistive')).toBeNull();
    expect(native.getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a role=alert wrapper wired to aria-describedby', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.selection-control__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain('Se aplică termenii MPay.');
    expect(native.getAttribute('aria-describedby')).toBe(wrapper.id);
  });

  it('lets the consumer swap helper for error — both land in the same wrapper', async () => {
    const { fixture, host, el, native } = await render();

    host.showHelper.set(true);
    await fixture.whenStable();
    host.showHelper.set(false);
    host.showError.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    const wrapper = el.querySelector('.selection-control__assistive') as HTMLElement;

    expect(wrapper.textContent).toContain('Trebuie să acceptați termenii.');
    expect(wrapper.textContent).not.toContain('Se aplică termenii MPay.');
    expect(el.classList.contains('is-invalid')).toBe(true);
    expect(native.getAttribute('aria-invalid')).toBe('true');
  });

  it('merges external aria-describedby ids with the internal assistive id when a message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.getAttribute('aria-describedby')).toBe('extra-id');

    host.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.selection-control__assistive') as HTMLElement;

    expect(native.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
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
});

@Component({
  imports: [MudCheckbox, ReactiveFormsModule],
  template: `<mud-checkbox [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl(true, { nonNullable: true, validators: [Validators.requiredTrue] });
}

@Component({
  imports: [MudCheckbox, FormField],
  template: `<mud-checkbox [formField]="form.subscribed" />`,
})
class SignalHost {
  readonly model = signal({ subscribed: false });
  readonly form = form(this.model);
}

@Component({
  imports: [MudCheckbox, MudInlineMessage],
  template: `
    <mud-checkbox aria-describedby="extra-id" [(checked)]="checked">
      @if (showMessage()) {
        <mud-inline-message hideIcon>Se aplică termenii MPay.</mud-inline-message>
      }
    </mud-checkbox>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly checked = signal(false);
  readonly showMessage = signal(false);
}
