import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MudSwitch } from './mud-switch.component';
import { MudInputLabel } from 'ngx-mud-ui/input';

@Component({
  imports: [MudSwitch],
  template: `
    <mud-switch
      label="Notificări"
      [(checked)]="checked"
      [disabled]="disabled()"
      [required]="requiredField()"
      (touch)="touches = touches + 1"
    />
  `,
})
class Host {
  readonly checked = signal(false);
  readonly disabled = signal(false);
  readonly requiredField = signal(false);
  touches = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-switch') as HTMLElement;
  const native = el.querySelector('input') as HTMLInputElement;

  return { fixture, host: fixture.componentInstance, el, native };
}

describe('MudSwitch', () => {
  it('renders a native checkbox with role=switch and the label association', async () => {
    const { el, native } = await render();
    const label = el.querySelector('.switch-control__label') as HTMLLabelElement;

    expect(native.type).toBe('checkbox');
    expect(native.getAttribute('role')).toBe('switch');
    expect(label.htmlFor).toBe(native.id);
    expect(el.querySelector('.switch-control__thumb')).toBeTruthy();
  });

  it('toggles the two-way model and reflects programmatic changes', async () => {
    const { fixture, host, el, native } = await render();

    native.click();
    await fixture.whenStable();
    expect(host.checked()).toBe(true);
    expect(el.classList.contains('is-checked')).toBe(true);

    host.checked.set(false);
    await fixture.whenStable();
    expect(native.checked).toBe(false);
    expect(el.classList.contains('is-checked')).toBe(false);
  });

  it('marks touched on blur and applies disabled + required', async () => {
    const { fixture, host, el, native } = await render();

    native.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(host.touches).toBe(1);

    host.disabled.set(true);
    host.requiredField.set(true);
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
    expect(native.required).toBe(true);
    expect(el.classList.contains('is-disabled')).toBe(true);
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

    host.control.disable();
    await fixture.whenStable();
    expect(native.disabled).toBe(true);
  });

  it('binds signal forms through [formField] via the checked contract', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const native = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    native.click();
    await fixture.whenStable();
    expect(host.model().notifications).toBe(true);

    host.model.set({ notifications: false });
    await fixture.whenStable();
    expect(native.checked).toBe(false);
  });

  it('renders a projected rich label and uses aria-label only without one', async () => {
    const slotted = TestBed.createComponent(SlottedHost);

    await slotted.whenStable();
    const el = slotted.nativeElement.querySelector('mud-switch') as HTMLElement;

    expect(el.querySelector('.switch-control__label .custom-label')).toBeTruthy();
    expect(el.querySelector('input')!.getAttribute('aria-label')).toBeNull();

    const unlabelled = TestBed.createComponent(UnlabelledHost);

    await unlabelled.whenStable();
    const native = unlabelled.nativeElement.querySelector('input') as HTMLInputElement;

    expect(native.getAttribute('aria-label')).toBe('Mod întunecat');
  });
});

@Component({
  imports: [MudSwitch, ReactiveFormsModule],
  template: `<mud-switch label="Notificări" [formControl]="control" />`,
})
class ReactiveHost {
  readonly control = new FormControl(true, { nonNullable: true });
}

@Component({
  imports: [MudSwitch, FormField],
  template: `<mud-switch label="Notificări" [formField]="form.notifications" />`,
})
class SignalHost {
  readonly model = signal({ notifications: false });
  readonly form = form(this.model);
}

@Component({
  imports: [MudSwitch, MudInputLabel],
  template: `
    <mud-switch [checked]="true">
      <span mudLabel class="custom-label">Notificări <strong>importante</strong></span>
    </mud-switch>
  `,
})
class SlottedHost {}

@Component({
  imports: [MudSwitch],
  template: `<mud-switch aria-label="Mod întunecat" />`,
})
class UnlabelledHost {}
