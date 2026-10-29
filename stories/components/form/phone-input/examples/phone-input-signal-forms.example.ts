import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

@Component({
  selector: 'app-phone-input-signal-forms',
  imports: [FormField, MudPhoneInput, MudLabel, MudInlineMessage],
  template: `
    <mud-phone-input mode="international" [formField]="contact.phone">
      <mud-label>Telefon de contact</mud-label>
      @if (contact.phone().touched() && contact.phone().invalid()) {
        <mud-inline-message variant="error">Introduceți numărul de telefon.</mud-inline-message>
      }
    </mud-phone-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class PhoneInputSignalFormsExample {
  readonly model = signal({ phone: '' });
  readonly contact = form(this.model, (path) => {
    required(path.phone);
  });
}
