import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudButton } from 'ngx-mud-ui/button';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-stepper-signal-forms',
  imports: [FormField, MudStepper, MudStep, MudButton, MudTextInput, MudLabel],
  template: `
    <mud-stepper #stepper linear>
      <mud-step label="Contact" errorMessage="Completați e-mailul" [stepControl]="contact">
        <div class="fields">
          <mud-text-input type="email" [formField]="contact.email">
            <mud-label>E-mail</mud-label>
          </mud-text-input>
        </div>
      </mud-step>
      <mud-step label="Confirmare">
        <p>Vă vom scrie la {{ model().email }}.</p>
      </mud-step>
    </mud-stepper>
    <div class="actions">
      <button type="button" mudButton="outlined" size="small" (click)="stepper.previous()">
        Înapoi
      </button>
      <button type="button" mudButton size="small" (click)="stepper.next()">Continuă</button>
    </div>
  `,
  styles: `
    .fields {
      max-width: 360px;
      padding: 16px 0;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
})
export class StepperSignalFormsExample {
  readonly model = signal({ email: '' });
  readonly contact = form(this.model, (path) => {
    required(path.email);
  });
}
