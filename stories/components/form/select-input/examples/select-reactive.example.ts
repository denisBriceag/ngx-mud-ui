import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

@Component({
  selector: 'app-select-reactive',
  imports: [ReactiveFormsModule, MudSelectInput, MudLabel, MudInlineMessage],
  template: `
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
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class SelectReactiveExample {
  readonly raions: MudSelectOption<string>[] = [
    { value: 'chisinau', label: 'Chișinău' },
    { value: 'balti', label: 'Bălți' },
    { value: 'cahul', label: 'Cahul' },
  ];
  readonly raion = new FormControl<string | null>(null, Validators.required);
}
