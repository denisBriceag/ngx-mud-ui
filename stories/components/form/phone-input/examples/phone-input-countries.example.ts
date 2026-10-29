import { Component } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudPhoneCountry } from 'ngx-mud-ui/phone-input';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

const POLAND: MudPhoneCountry = {
  iso: 'PL',
  dialCode: '+48',
  name: 'Poland',
  mask: 'XXX XXX XXX',
  minDigits: 9,
  maxDigits: 9,
  aliases: ['Polska'],
};

@Component({
  selector: 'app-phone-input-countries',
  imports: [MudPhoneInput, MudLabel],
  template: `
    <!-- Built-in ISO codes narrow the list; MudPhoneCountry objects add countries. -->
    <mud-phone-input mode="international" country="PL" [countries]="countries">
      <mud-label>Telefon</mud-label>
    </mud-phone-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class PhoneInputCountriesExample {
  readonly countries = ['MD', 'RO', POLAND];
}
