import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudRadioGroup } from './mud-radio-group.component';
import { MudRadio } from './mud-radio.component';
import { MudLabel } from '../../../label/src/public-api';
import { MudInlineMessage } from '../../../inline-message/src/public-api';

@Component({
  imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage],
  template: `
    <mud-radio-group
      [(value)]="value"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [invalid]="invalid()"
      [required]="requiredGroup()"
      [size]="size()"
      (touch)="touches = touches + 1"
    >
      @if (withLabel()) {
        <mud-label>Metoda de plată</mud-label>
      }
      <mud-radio value="card">
        <mud-label>Card bancar</mud-label>
      </mud-radio>
      <mud-radio value="mpay">
        @if (withRadioLabel()) {
          <mud-label>MPay</mud-label>
        }
        @if (showRadioHelper()) {
          <mud-inline-message hideIcon>Fără comision.</mud-inline-message>
        }
        @if (showRadioError()) {
          <mud-inline-message variant="error">Opțiune indisponibilă azi.</mud-inline-message>
        }
      </mud-radio>
      <mud-radio value="cash" [disabled]="cashDisabled()">
        <mud-label>Numerar</mud-label>
      </mud-radio>
      @if (showGroupHelper()) {
        <mud-inline-message hideIcon>Plata se procesează instant.</mud-inline-message>
      }
      @if (showGroupError()) {
        <mud-inline-message variant="error">Alegeți o metodă de plată.</mud-inline-message>
      }
    </mud-radio-group>
  `,
})
class Host {
  readonly value = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly invalid = signal(false);
  readonly requiredGroup = signal(false);
  readonly size = signal<'medium' | 'small'>('medium');
  readonly cashDisabled = signal(false);
  readonly withLabel = signal(true);
  readonly withRadioLabel = signal(true);
  readonly showRadioHelper = signal(false);
  readonly showRadioError = signal(false);
  readonly showGroupHelper = signal(false);
  readonly showGroupError = signal(false);
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

    // The required validator surfaces as invalid/touched; the consumer
    // decides whether/what message to project for it.
    host.model.set({ method: '' });
    await fixture.whenStable();
    expect(host.form.method().invalid()).toBe(true);
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

  it('renders the projected mud-label inside the group label element', async () => {
    const { group } = await render();
    const label = group.querySelector('.radio-group__label')!;

    expect(label.textContent).toContain('Metoda de plată');
  });

  it('renders no group label element and no aria-labelledby without a projected mud-label', async () => {
    const { fixture, host, group } = await render();

    host.withLabel.set(false);
    await fixture.whenStable();

    expect(group.querySelector('.radio-group__label')).toBeNull();
    expect(group.getAttribute('aria-labelledby')).toBeNull();
  });

  it('renders no group assistive wrapper and no describedby when nothing is projected', async () => {
    const { group } = await render();

    expect(group.querySelector('.radio-group__assistive')).toBeNull();
    expect(group.getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a role=alert wrapper wired into aria-describedby', async () => {
    const { fixture, host, group } = await render();

    host.showGroupHelper.set(true);
    await fixture.whenStable();

    const wrapper = group.querySelector('.radio-group__assistive') as HTMLElement;

    expect(wrapper.getAttribute('role')).toBe('alert');
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain('Plata se procesează instant.');
    expect(group.getAttribute('aria-describedby')).toBe(wrapper.id);
  });

  it('lets the consumer swap helper for error — both land in the same group wrapper', async () => {
    const { fixture, host, group } = await render();

    host.showGroupHelper.set(true);
    await fixture.whenStable();
    host.showGroupHelper.set(false);
    host.showGroupError.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    const wrapper = group.querySelector('.radio-group__assistive') as HTMLElement;

    expect(wrapper.textContent).toContain('Alegeți o metodă de plată.');
    expect(wrapper.textContent).not.toContain('Plata se procesează instant.');
    expect(group.getAttribute('aria-invalid')).toBe('true');
  });

  it('can show two group messages at once, in template order', async () => {
    const { fixture, host, group } = await render();

    host.showGroupHelper.set(true);
    host.showGroupError.set(true);
    await fixture.whenStable();

    const messages = group.querySelectorAll('.radio-group__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Plata se procesează instant.');
    expect(messages[1].textContent).toContain('Alegeți o metodă de plată.');
  });

  it('merges external aria-describedby ids with the internal assistive id when a group message is shown', async () => {
    const fixture = TestBed.createComponent(ExternalDescribedHost);

    await fixture.whenStable();
    const group = fixture.nativeElement.querySelector('mud-radio-group') as HTMLElement;

    expect(group.getAttribute('aria-describedby')).toBe('extra-id');

    fixture.componentInstance.showMessage.set(true);
    await fixture.whenStable();

    const wrapper = group.querySelector('.radio-group__assistive') as HTMLElement;

    expect(group.getAttribute('aria-describedby')).toBe(`${wrapper.id} extra-id`);
  });

  it('keeps a radio-projected message inside that radio and a group-projected message inside the group wrapper', async () => {
    const { fixture, host, group, radios } = await render();

    host.showRadioHelper.set(true);
    host.showGroupError.set(true);
    host.invalid.set(true);
    await fixture.whenStable();

    const groupWrapper = group.querySelector('.radio-group__assistive') as HTMLElement;
    const radioWrapper = radios()[1].querySelector('.selection-control__assistive') as HTMLElement;

    expect(groupWrapper.textContent).toContain('Alegeți o metodă de plată.');
    expect(groupWrapper.textContent).not.toContain('Fără comision.');
    expect(radioWrapper.textContent).toContain('Fără comision.');
    expect(radioWrapper.textContent).not.toContain('Alegeți o metodă de plată.');
  });
});

describe('MudRadio', () => {
  it('renders the projected mud-label inside the radio label element', async () => {
    const { radios, natives } = await render();
    const label = radios()[1].querySelector('.selection-control__label') as HTMLLabelElement;

    expect(label.textContent).toContain('MPay');
    expect(label.htmlFor).toBe(natives()[1].id);
  });

  it('renders no label element without a projected mud-label', async () => {
    const { fixture, host, radios } = await render();

    host.withRadioLabel.set(false);
    await fixture.whenStable();

    expect(radios()[1].querySelector('.selection-control__label')).toBeNull();
  });

  it('renders no assistive wrapper and no describedby when nothing is projected', async () => {
    const { radios, natives } = await render();

    expect(radios()[2].querySelector('.selection-control__assistive')).toBeNull();
    expect(natives()[2].getAttribute('aria-describedby')).toBeNull();
  });

  it('projects inline-messages into a wrapper WITHOUT role — a single radio has no invalid state', async () => {
    const { fixture, host, radios, natives } = await render();

    host.showRadioHelper.set(true);
    await fixture.whenStable();

    const wrapper = radios()[1].querySelector('.selection-control__assistive') as HTMLElement;

    expect(wrapper.hasAttribute('role')).toBe(false);
    expect(wrapper.querySelector('mud-inline-message')?.textContent).toContain('Fără comision.');
    expect(natives()[1].getAttribute('aria-describedby')).toBe(wrapper.id);
  });

  it('lets the consumer swap helper for error — both land in the same radio wrapper', async () => {
    const { fixture, host, radios } = await render();

    host.showRadioHelper.set(true);
    await fixture.whenStable();
    host.showRadioHelper.set(false);
    host.showRadioError.set(true);
    await fixture.whenStable();

    const wrapper = radios()[1].querySelector('.selection-control__assistive') as HTMLElement;

    expect(wrapper.textContent).toContain('Opțiune indisponibilă azi.');
    expect(wrapper.textContent).not.toContain('Fără comision.');
  });

  it('can show two messages at once on a single radio, in template order', async () => {
    const { fixture, host, radios } = await render();

    host.showRadioHelper.set(true);
    host.showRadioError.set(true);
    await fixture.whenStable();

    const messages = radios()[1].querySelectorAll('.selection-control__assistive mud-inline-message');

    expect(messages.length).toBe(2);
    expect(messages[0].textContent).toContain('Fără comision.');
    expect(messages[1].textContent).toContain('Opțiune indisponibilă azi.');
  });
});

@Component({
  imports: [MudRadioGroup, MudRadio, MudLabel, ReactiveFormsModule],
  template: `
    <mud-radio-group [formControl]="control">
      <mud-label>Metoda</mud-label>
      <mud-radio value="card">
        <mud-label>Card</mud-label>
      </mud-radio>
      <mud-radio value="mpay">
        <mud-label>MPay</mud-label>
      </mud-radio>
    </mud-radio-group>
  `,
})
class ReactiveHost {
  readonly control = new FormControl('card', { nonNullable: true, validators: [Validators.required] });
}

@Component({
  imports: [MudRadioGroup, MudRadio, MudLabel, FormField],
  template: `
    <mud-radio-group [formField]="form.method">
      <mud-label>Metoda</mud-label>
      <mud-radio value="card">
        <mud-label>Card</mud-label>
      </mud-radio>
      <mud-radio value="mpay">
        <mud-label>MPay</mud-label>
      </mud-radio>
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
  imports: [MudRadioGroup, MudRadio, MudInlineMessage],
  template: `
    <mud-radio-group aria-describedby="extra-id" [(value)]="value">
      <mud-radio value="card" />
      @if (showMessage()) {
        <mud-inline-message variant="error">Alegeți o metodă de plată.</mud-inline-message>
      }
    </mud-radio-group>
    <p id="extra-id">Notă externă.</p>
  `,
})
class ExternalDescribedHost {
  readonly value = signal<string | undefined>(undefined);
  readonly showMessage = signal(false);
}
