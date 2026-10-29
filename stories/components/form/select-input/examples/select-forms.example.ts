import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

@Component({
  selector: 'app-select-forms',
  imports: [ReactiveFormsModule, FormField, MudSelectInput, MudLabel, MudInlineMessage],
  template: `
    <!-- Reactive forms: bind invalid yourself. -->
    <mud-select-input
      [options]="raions"
      [formControl]="raion"
      required
      [invalid]="raion.touched && raion.invalid"
    >
      <mud-label>Raion</mud-label>
      @if (raion.touched && raion.invalid) {
        <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
      }
    </mud-select-input>

    <!-- Signal forms, with number values: the value keeps its type. -->
    <mud-select-input [options]="copies" [formField]="order.copies">
      <mud-label>Număr de exemplare</mud-label>
      @if (order.copies().touched() && order.copies().invalid()) {
        <mud-inline-message variant="error">Alegeți numărul de exemplare.</mud-inline-message>
      }
    </mud-select-input>
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
export class SelectFormsExample {
  readonly raions: MudSelectOption<string>[] = [
    { value: 'chisinau', label: 'Chișinău' },
    { value: 'balti', label: 'Bălți' },
    { value: 'cahul', label: 'Cahul' },
  ];
  readonly raion = new FormControl<string | null>(null, Validators.required);

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
