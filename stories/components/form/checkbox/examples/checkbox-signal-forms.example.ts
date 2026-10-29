import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-checkbox-signal-forms',
  imports: [FormField, MudCheckbox, MudLabel, MudInlineMessage],
  template: `
    <!-- [formField] binds the value, disabled and invalid for you. -->
    <mud-checkbox [formField]="consent.data">
      <mud-label>Consimt prelucrarea datelor personale</mud-label>
      @if (consent.data().touched() && consent.data().invalid()) {
        <mud-inline-message variant="error"
          >Bifați consimțământul pentru a continua.</mud-inline-message
        >
      }
    </mud-checkbox>
  `,
})
export class CheckboxSignalFormsExample {
  readonly model = signal({ data: false });
  readonly consent = form(this.model, (path) => {
    required(path.data);
  });
}
