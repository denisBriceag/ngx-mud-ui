import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-forms',
  imports: [ReactiveFormsModule, FormField, MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <!-- Reactive forms: most backends already send YYYY-MM-DD, so there's nothing to convert. -->
    <mud-date-input
      [formControl]="dob"
      required
      headerStyle="dropdown"
      [invalid]="dob.touched && dob.invalid"
    >
      <mud-label>Data nașterii</mud-label>
      @if (dob.touched && dob.invalid) {
        <mud-inline-message variant="error">Alegeți data nașterii.</mud-inline-message>
      }
    </mud-date-input>

    <!-- Signal forms -->
    <mud-date-input [formField]="request.deadline">
      <mud-label>Termen</mud-label>
      @if (request.deadline().touched() && request.deadline().invalid()) {
        <mud-inline-message variant="error">Alegeți un termen.</mud-inline-message>
      }
    </mud-date-input>
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
export class DateFormsExample {
  readonly dob = new FormControl<string | null>('1990-05-15', Validators.required);

  readonly model = signal<{ deadline: string | null }>({ deadline: null });
  readonly request = form(this.model, (path) => {
    required(path.deadline);
  });
}
