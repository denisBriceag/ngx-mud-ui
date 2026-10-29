import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-signal-forms',
  imports: [FormField, MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <mud-date-input [formField]="request.deadline">
      <mud-label>Termen</mud-label>
      @if (request.deadline().touched() && request.deadline().invalid()) {
        <mud-inline-message variant="error">Alegeți un termen.</mud-inline-message>
      }
    </mud-date-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class DateSignalFormsExample {
  readonly model = signal<{ deadline: string | null }>({ deadline: null });
  readonly request = form(this.model, (path) => {
    required(path.deadline);
  });
}
