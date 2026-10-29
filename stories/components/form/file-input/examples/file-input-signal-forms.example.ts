import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudFileInput } from 'ngx-mud-ui/file-input';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-file-input-signal-forms',
  imports: [FormField, MudFileInput, MudLabel, MudInlineMessage],
  template: `
    <mud-file-input accept=".pdf" [formField]="application.signedForm">
      <mud-label>Cererea semnată</mud-label>
      @if (application.signedForm().touched() && application.signedForm().invalid()) {
        <mud-inline-message variant="error">Încărcați cererea semnată.</mud-inline-message>
      }
    </mud-file-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 520px;
    }
  `,
})
export class FileInputSignalFormsExample {
  readonly model = signal<{ signedForm: File[] }>({ signedForm: [] });
  readonly application = form(this.model, (path) => {
    required(path.signedForm);
  });
}
