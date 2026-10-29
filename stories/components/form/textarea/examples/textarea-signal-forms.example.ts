import { Component, signal } from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextarea } from 'ngx-mud-ui/textarea';

@Component({
  selector: 'app-textarea-signal-forms',
  imports: [FormField, MudTextarea, MudLabel, MudInlineMessage],
  template: `
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
      display: block;
      max-width: 480px;
    }
  `,
})
export class TextareaSignalFormsExample {
  readonly model = signal({ comment: '' });
  readonly feedback = form(this.model, (path) => {
    required(path.comment);
    maxLength(path.comment, 500);
  });
}
