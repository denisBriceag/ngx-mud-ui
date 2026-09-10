import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudRadioGroup } from './mud-radio-group.component';
import { MudRadio } from './mud-radio.component';
import { MudFieldError, MudFieldLabel } from 'ngx-mud-ui/text-input';

@Component({
  imports: [MudRadioGroup, MudRadio],
  template: `
    <mud-radio-group
      label="Metoda de plată"
      [(value)]="value"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [invalid]="invalid()"
      [errorText]="errorText()"
      [required]="requiredGroup()"
      [size]="size()"
      (touch)="touches = touches + 1"
    >
      <mud-radio value="card" label="Card bancar" />
      <mud-radio value="mpay" label="MPay" supportingText="Fără comision." />
      <mud-radio value="cash" label="Numerar" [disabled]="cashDisabled()" />
    </mud-radio-group>
  `,
})
class Host {
  readonly value = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly invalid = signal(false);
  readonly errorText = signal<string | undefined>(undefined);
  readonly requiredGroup = signal(false);
  readonly size = signal<'medium' | 'small'>('medium');
  readonly cashDisabled = signal(false);
  touches = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const group = fixture.nativeElement.querySelector('mud-radio-group') as HTMLElement;
  const radios = () => Array.from(group.querySelectorAll('mud-radio')) as HTMLElement[];
  const natives = () => Array.from(group.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];

  return { fixture, host: fixture.componentInstance, group, radios, natives };
}

describe('MudRadioGroup', () => {
  it('renders a radiogroup with a shared native name and the label wiring', async () => {
    const { group, natives } = await render();

    expect(group.getAttribute('role')).toBe('radiogroup');

    const label = group.querySelector('.radio-group__label')!;

    expect(group.getAttribute('aria-labelledby')).toBe(label.id);

    const names = new Set(natives().map((n) => n.name));

    expect(names.size).toBe(1);
    expect([...names][0]).toContain('mud-radio-group');
  });

  it('derives checked from the group value, both ways', async () => {
    const { fixture, host, radios, natives } = await render();

    natives()[1].click();
    await fixture.whenStable();
    expect(host.value()).toBe('mpay');
    expect(radios()[1].classList.contains('is-checked')).toBe(true);

    host.value.set('card');
    await fixture.whenStable();
    expect(natives()[0].checked).toBe(true);
    expect(radios()[1].classList.contains('is-checked')).toBe(false);
  });

  it('propagates disabled/readonly/size/invalid to the children', async () => {
    const { fixture, host, radios, natives } = await render();

    host.disabled.set(true);
    host.size.set('small');
    host.invalid.set(true);
    await fixture.whenStable();

    expect(natives().every((n) => n.disabled)).toBe(true);
    expect(radios().every((r) => r.classList.contains('selection-control--sm'))).toBe(true);
    expect(radios().every((r) => r.classList.contains('is-invalid'))).toBe(true);

    host.disabled.set(false);
    host.cashDisabled.set(true);
    await fixture.whenStable();
    expect(natives()[2].disabled).toBe(true);
    expect(natives()[0].disabled).toBe(false);

    host.readonly.set(true);
    await fixture.whenStable();
    natives()[0].click();
    await fixture.whenStable();
    expect(host.value()).toBe(undefined);

    // Arrow keys must not change a readonly group either (they select
    // natively without a click).
    const arrow = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });

    natives()[0].dispatchEvent(arrow);
    await fixture.whenStable();
    expect(arrow.defaultPrevented).toBe(true);
    expect(host.value()).toBe(undefined);
  });

  it('shows the group error with role=alert wired into aria-describedby', async () => {
    const { fixture, host, group } = await render();

    host.invalid.set(true);
    host.errorText.set('Alegeți o metodă de plată.');
    await fixture.whenStable();

    const error = group.querySelector('.radio-group__error')!;

    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toContain('Alegeți');
    expect(group.getAttribute('aria-describedby')).toBe(error.id);
    expect(group.getAttribute('aria-invalid')).toBe('true');
  });

  it('marks required on the group and the native inputs', async () => {
    const { fixture, host, group, natives } = await render();

    host.requiredGroup.set(true);
    await fixture.whenStable();

    expect(group.getAttribute('aria-required')).toBe('true');
    expect(group.querySelector('.radio-group__required')).toBeTruthy();
    expect(natives().every((n) => n.required)).toBe(true);
  });

  it('emits touch only when focus leaves the group entirely', async () => {
    const { fixture, host, natives } = await render();
    const [first, second] = natives();

    first.focus();
    first.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: second }));
    await fixture.whenStable();
    expect(host.touches).toBe(0);

    first.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    await fixture.whenStable();
    expect(host.touches).toBe(1);
  });

  it('works as a reactive form control on the group', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const natives = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;

    expect(natives[0].checked).toBe(true);

    natives[1].click();
    await fixture.whenStable();
    expect(host.control.value).toBe('mpay');

    host.control.disable();
    await fixture.whenStable();
    expect(natives[1].disabled).toBe(true);
  });

  it('binds signal forms through [formField] on the group', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const el = fixture.nativeElement.querySelector('mud-radio-group') as HTMLElement;
    const natives = el.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;

    natives[1].click();
    await fixture.whenStable();
    expect(host.model().method).toBe('mpay');

    // The required validator surfaces as the group error after clearing.
    host.model.set({ method: '' });
    await fixture.whenStable();
    expect(host.form.method().invalid()).toBe(true);
    expect(el.querySelector('.radio-group__error')?.textContent).toContain('Alegeți o metodă');
  });

  it('focus() lands on the selected option, else the first enabled one', async () => {
    const { fixture, host, natives } = await render();
    const groupInstance = fixture.debugElement.children[0].componentInstance as MudRadioGroup<string>;

    groupInstance.focus();
    expect(document.activeElement).toBe(natives()[0]);

    host.value.set('mpay');
    await fixture.whenStable();
    groupInstance.focus();
    expect(document.activeElement).toBe(natives()[1]);
  });

  it('supports projected group label and error content', async () => {
    const fixture = TestBed.createComponent(SlottedHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-radio-group') as HTMLElement;

    expect(el.querySelector('.radio-group__label .custom-label')).toBeTruthy();
    expect(el.querySelector('.radio-group__error .custom-error')).toBeTruthy();
  });
});

@Component({
  imports: [MudRadioGroup, MudRadio, ReactiveFormsModule],
  template: `
    <mud-radio-group label="Metoda" [formControl]="control">
      <mud-radio value="card" label="Card" />
      <mud-radio value="mpay" label="MPay" />
    </mud-radio-group>
  `,
})
class ReactiveHost {
  readonly control = new FormControl('card', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  imports: [MudRadioGroup, MudRadio, FormField],
  template: `
    <mud-radio-group label="Metoda" [formField]="form.method">
      <mud-radio value="card" label="Card" />
      <mud-radio value="mpay" label="MPay" />
    </mud-radio-group>
  `,
})
class SignalHost {
  readonly model = signal({ method: '' });
  readonly form = form(this.model, (path) => {
    required(path.method, { message: 'Alegeți o metodă.' });
  });
}

@Component({
  imports: [MudRadioGroup, MudRadio, MudFieldLabel, MudFieldError],
  template: `
    <mud-radio-group invalid>
      <span mudLabel class="custom-label">Metoda <em>de plată</em></span>
      <mud-radio value="card" label="Card" />
      <span mudError class="custom-error">Eroare proiectată.</span>
    </mud-radio-group>
  `,
})
class SlottedHost {}
