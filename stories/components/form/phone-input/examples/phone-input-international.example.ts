import { Component, signal } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

@Component({
  selector: 'app-phone-input-international',
  imports: [MudPhoneInput, MudLabel],
  template: `
    <mud-phone-input mode="international" [(country)]="country" [(value)]="phone">
      <mud-label>Telefon</mud-label>
    </mud-phone-input>
    <p>country: {{ country() }} · value: "{{ phone() }}"</p>

    <!-- Country names come from Intl.DisplayNames in the field's locale. -->
    <mud-phone-input mode="international" locale="ru" country="DE">
      <mud-label>Телефон (ru)</mud-label>
    </mud-phone-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 420px;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class PhoneInputInternationalExample {
  readonly country = signal('MD');
  // A stored number selects its country by dial code: +40 picks Romania.
  readonly phone = signal('+40712345678');
}
