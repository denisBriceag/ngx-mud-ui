import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

@Component({
  selector: 'app-phone-input-reactive',
  imports: [ReactiveFormsModule, MudPhoneInput, MudLabel, MudInlineMessage],
  template: `
    <!-- An empty field is '', so Validators.required works as written. -->
    <mud-phone-input [formControl]="phone" required [invalid]="phone.touched && phone.invalid">
      <mud-label>Telefon</mud-label>
      @if (phone.touched && phone.invalid) {
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
export class PhoneInputReactiveExample {
  readonly phone = new FormControl('', { nonNullable: true, validators: Validators.required });
}
