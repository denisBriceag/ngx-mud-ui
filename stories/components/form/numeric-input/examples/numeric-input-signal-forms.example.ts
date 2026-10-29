import { Component, signal } from '@angular/core';
import { form, FormField, max, min, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

@Component({
  selector: 'app-numeric-input-signal-forms',
  imports: [FormField, MudNumericInput, MudLabel, MudInlineMessage],
  template: `
    <mud-numeric-input [formField]="household.members" showSteppers [allowDecimal]="false">
      <mud-label>Membri ai familiei</mud-label>
      @if (household.members().touched() && household.members().invalid()) {
        <mud-inline-message variant="error">Între 1 și 20 de persoane.</mud-inline-message>
      }
    </mud-numeric-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 320px;
    }
  `,
})
export class NumericInputSignalFormsExample {
  readonly model = signal<{ members: number | null }>({ members: 1 });
  readonly household = form(this.model, (path) => {
    required(path.members);
    min(path.members, 1);
    max(path.members, 20);
  });
}
