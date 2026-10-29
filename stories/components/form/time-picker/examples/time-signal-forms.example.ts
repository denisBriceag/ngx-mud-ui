import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTimeInput } from 'ngx-mud-ui/time-picker';

@Component({
  selector: 'app-time-signal-forms',
  imports: [FormField, MudTimeInput, MudLabel, MudInlineMessage],
  template: `
    <mud-time-input [formField]="meeting.end" clearable>
      <mud-label>Ora de sfârșit</mud-label>
      @if (meeting.end().touched() && meeting.end().invalid()) {
        <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
      }
    </mud-time-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 320px;
    }
  `,
})
export class TimeSignalFormsExample {
  readonly model = signal<{ end: string | null }>({ end: null });
  readonly meeting = form(this.model, (path) => {
    required(path.end);
  });
}
