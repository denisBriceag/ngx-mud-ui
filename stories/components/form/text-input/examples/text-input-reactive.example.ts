import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-text-input-reactive',
  imports: [ReactiveFormsModule, MudTextInput, MudLabel, MudInlineMessage],
  template: `
    <mud-text-input
      [formControl]="idnp"
      required
      inputMode="numeric"
      [maxLength]="13"
      [invalid]="idnp.invalid && idnp.touched"
    >
      <mud-label>IDNP</mud-label>
      @if (idnp.touched && idnp.hasError('required')) {
        <mud-inline-message variant="error">Introduceți IDNP-ul.</mud-inline-message>
      } @else if (idnp.touched && idnp.hasError('pattern')) {
        <mud-inline-message variant="error"
          >IDNP-ul trebuie să conțină 13 cifre.</mud-inline-message
        >
      } @else {
        <mud-inline-message hideIcon>13 cifre, de pe actul de identitate.</mud-inline-message>
      }
    </mud-text-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class TextInputReactiveExample {
  readonly idnp = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{13}$/)],
  });
}
