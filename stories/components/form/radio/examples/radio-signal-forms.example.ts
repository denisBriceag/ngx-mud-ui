import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';

@Component({
  selector: 'app-radio-signal-forms',
  imports: [FormField, MudRadioGroup, MudRadio, MudLabel, MudInlineMessage],
  template: `
    <!-- Non-string values keep their type; they're compared with Object.is. -->
    <mud-radio-group [formField]="order.copies">
      <mud-label>Numărul de exemplare</mud-label>
      <mud-radio [value]="1"><mud-label>Un exemplar</mud-label></mud-radio>
      <mud-radio [value]="2"><mud-label>Două exemplare</mud-label></mud-radio>
      <mud-radio [value]="5">
        <mud-label>Cinci exemplare</mud-label>
        <mud-inline-message hideIcon>Taxă suplimentară.</mud-inline-message>
      </mud-radio>
      @if (order.copies().touched() && order.copies().invalid()) {
        <mud-inline-message variant="error">Alegeți numărul de exemplare.</mud-inline-message>
      }
    </mud-radio-group>
    <p>copies: {{ model().copies ?? '—' }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class RadioSignalFormsExample {
  readonly model = signal<{ copies: number | null }>({ copies: null });
  readonly order = form(this.model, (path) => {
    required(path.copies);
  });
}
