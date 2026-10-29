import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTimeInput } from 'ngx-mud-ui/time-picker';

@Component({
  selector: 'app-time-forms',
  imports: [ReactiveFormsModule, FormField, MudTimeInput, MudLabel, MudInlineMessage],
  template: `
    <!-- Reactive forms: bind invalid yourself. -->
    <mud-time-input
      [formControl]="start"
      required
      clearable
      [invalid]="start.touched && start.invalid"
    >
      <mud-label>Ora de început</mud-label>
      @if (start.touched && start.invalid) {
        <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
      }
    </mud-time-input>

    <!-- Signal forms -->
    <mud-time-input [formField]="meeting.end" clearable>
      <mud-label>Ora de sfârșit</mud-label>
      @if (meeting.end().touched() && meeting.end().invalid()) {
        <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
      }
    </mud-time-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 320px;
    }
  `,
})
export class TimeFormsExample {
  readonly start = new FormControl<string | null>(null, Validators.required);

  readonly model = signal<{ end: string | null }>({ end: null });
  readonly meeting = form(this.model, (path) => {
    required(path.end);
  });
}
