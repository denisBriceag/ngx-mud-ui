import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

@Component({
  selector: 'app-numeric-input-states',
  imports: [MudNumericInput, MudLabel, MudInlineMessage],
  template: `
    <mud-numeric-input invalid [value]="-5">
      <mud-label>Eroare</mud-label>
      <mud-inline-message variant="error">Valoarea trebuie să fie pozitivă.</mud-inline-message>
    </mud-numeric-input>
    <mud-numeric-input loading [value]="42">
      <mud-label>Se încarcă</mud-label>
    </mud-numeric-input>
    <mud-numeric-input disabled [value]="42" showSteppers>
      <mud-label>Dezactivat</mud-label>
    </mud-numeric-input>
    <mud-numeric-input size="large" [maxLength]="6" [counterLabel]="'Cel mult 6 cifre'">
      <mud-label>Cod poștal (large, cu contor)</mud-label>
    </mud-numeric-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 320px;
    }
  `,
})
export class NumericInputStatesExample {}
