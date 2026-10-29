import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextarea } from 'ngx-mud-ui/textarea';

@Component({
  selector: 'app-textarea-forms',
  imports: [ReactiveFormsModule, FormField, MudTextarea, MudLabel, MudInlineMessage],
  template: `
    <!-- Reactive forms: bind invalid yourself. -->
    <mud-textarea
      [formControl]="reason"
      required
      [maxLength]="200"
      [invalid]="reason.invalid && reason.touched"
    >
      <mud-label>Motivul cererii</mud-label>
      @if (reason.invalid && reason.touched) {
        <mud-inline-message variant="error">Motivul este obligatoriu.</mud-inline-message>
      }
    </mud-textarea>

    <!-- Signal forms: required, maxLength and invalid follow the field. -->
    <mud-textarea [formField]="feedback.comment">
      <mud-label>Comentariu</mud-label>
      @if (feedback.comment().touched() && feedback.comment().invalid()) {
        <mud-inline-message variant="error"
          >Scrieți un comentariu de cel mult 500 de caractere.</mud-inline-message
        >
      }
    </mud-textarea>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 480px;
    }
  `,
})
export class TextareaFormsExample {
  readonly reason = new FormControl('', { nonNullable: true, validators: Validators.required });

  readonly model = signal({ comment: '' });
  readonly feedback = form(this.model, (path) => {
    required(path.comment);
    maxLength(path.comment, 500);
  });
}
