import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

@Component({
  selector: 'app-phone-input-forms',
  imports: [ReactiveFormsModule, FormField, MudPhoneInput, MudLabel, MudInlineMessage],
  template: `
    <!-- Reactive forms: an empty field is '', so Validators.required works as written. -->
    <mud-phone-input [formControl]="phone" required [invalid]="phone.touched && phone.invalid">
      <mud-label>Telefon</mud-label>
      @if (phone.touched && phone.invalid) {
        <mud-inline-message variant="error">Introduceți numărul de telefon.</mud-inline-message>
      }
    </mud-phone-input>

    <!-- Signal forms -->
    <mud-phone-input mode="international" [formField]="contact.phone">
      <mud-label>Telefon de contact</mud-label>
      @if (contact.phone().touched() && contact.phone().invalid()) {
        <mud-inline-message variant="error">Introduceți numărul de telefon.</mud-inline-message>
      }
    </mud-phone-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 420px;
    }
  `,
})
export class PhoneInputFormsExample {
  readonly phone = new FormControl('', { nonNullable: true, validators: Validators.required });

  readonly model = signal({ phone: '' });
  readonly contact = form(this.model, (path) => {
    required(path.phone);
  });
}
