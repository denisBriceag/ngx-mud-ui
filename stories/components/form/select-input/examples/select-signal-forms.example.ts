import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

@Component({
  selector: 'app-select-signal-forms',
  imports: [FormField, MudSelectInput, MudLabel, MudInlineMessage],
  template: `
    <!-- Number values keep their type. -->
    <mud-select-input [options]="copies" [formField]="order.copies">
      <mud-label>Număr de exemplare</mud-label>
      @if (order.copies().touched() && order.copies().invalid()) {
        <mud-inline-message variant="error">Alegeți numărul de exemplare.</mud-inline-message>
      }
    </mud-select-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class SelectSignalFormsExample {
  readonly copies: MudSelectOption<number>[] = [
    { value: 1, label: 'Un exemplar' },
    { value: 2, label: 'Două exemplare' },
    { value: 5, label: 'Cinci exemplare' },
  ];
  readonly model = signal<{ copies: number | null }>({ copies: null });
  readonly order = form(this.model, (path) => {
    required(path.copies);
  });
}
