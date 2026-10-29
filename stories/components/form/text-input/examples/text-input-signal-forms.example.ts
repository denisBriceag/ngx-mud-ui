import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-text-input-signal-forms',
  imports: [FormField, MudTextInput, MudLabel, MudInlineMessage],
  template: `
    <!-- [formField] binds the value, disabled, required and invalid for you. -->
    <mud-text-input type="email" autocomplete="email" [formField]="contact.email">
      <mud-label>E-mail</mud-label>
      @if (contact.email().touched() && contact.email().invalid()) {
        @for (error of contact.email().errors(); track error.kind) {
          <mud-inline-message variant="error">{{ error.message }}</mud-inline-message>
        }
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
export class TextInputSignalFormsExample {
  readonly model = signal({ email: '' });
  readonly contact = form(this.model, (path) => {
    required(path.email, { message: 'Introduceți adresa de e-mail.' });
    email(path.email, { message: 'Adresa de e-mail nu este validă.' });
  });
}
