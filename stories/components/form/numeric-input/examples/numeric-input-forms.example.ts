import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, max, min, required } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

@Component({
  selector: 'app-numeric-input-forms',
  imports: [ReactiveFormsModule, FormField, MudNumericInput, MudLabel, MudInlineMessage],
  template: `
    <!-- Reactive forms: bind invalid yourself. -->
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

    <!-- Signal forms: min, max, required and invalid follow the field. -->
    <mud-numeric-input [formField]="household.members" showSteppers [allowDecimal]="false">
      <mud-label>Membri ai familiei</mud-label>
      @if (household.members().touched() && household.members().invalid()) {
        <mud-inline-message variant="error">Între 1 și 20 de persoane.</mud-inline-message>
      }
    </mud-numeric-input>
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
export class NumericInputFormsExample {
  readonly income = new FormControl<number | null>(null, Validators.required);

  readonly model = signal<{ members: number | null }>({ members: 1 });
  readonly household = form(this.model, (path) => {
    required(path.members);
    min(path.members, 1);
    max(path.members, 20);
  });
}
