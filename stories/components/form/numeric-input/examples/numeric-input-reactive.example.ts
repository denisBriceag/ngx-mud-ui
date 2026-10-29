import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

@Component({
  selector: 'app-numeric-input-reactive',
  imports: [ReactiveFormsModule, MudNumericInput, MudLabel, MudInlineMessage],
  template: `
    <mud-numeric-input
      [formControl]="income"
      required
      [min]="0"
      locale="ro-MD"
      [invalid]="income.invalid && income.touched"
    >
      <mud-label>Venit lunar</mud-label>
      <span suffix>MDL</span>
      @if (income.invalid && income.touched) {
        <mud-inline-message variant="error">Introduceți venitul.</mud-inline-message>
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
export class NumericInputReactiveExample {
  readonly income = new FormControl<number | null>(null, Validators.required);
}
