import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

@Component({
  selector: 'app-select-states',
  imports: [MudSelectInput, MudLabel, MudInlineMessage],
  template: `
    <mud-select-input [options]="raions" required invalid>
      <mud-label>Obligatoriu, cu eroare</mud-label>
      <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
    </mud-select-input>
    <mud-select-input [options]="raions" value="balti" readonly
      ><mud-label>Doar citire</mud-label></mud-select-input
    >
    <mud-select-input [options]="raions" value="balti" disabled
      ><mud-label>Dezactivat</mud-label></mud-select-input
    >
    <mud-select-input [options]="[]"><mud-label>Fără opțiuni</mud-label></mud-select-input>
    <mud-select-input [options]="raions" size="large"
      ><mud-label>Mare (large)</mud-label></mud-select-input
    >
    <mud-select-input [options]="raions" placeholder="Alegeți orașul">
      <!-- A start icon: mark it aria-hidden; a click on it opens the list. -->
      <svg
        icon-start
        viewBox="0 0 20 20"
        width="20"
        height="20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M10 1.667a5.833 5.833 0 0 0-5.833 5.833c0 4.167 5.833 10.833 5.833 10.833s5.833-6.666 5.833-10.833A5.833 5.833 0 0 0 10 1.667m0 7.916a2.083 2.083 0 1 1 0-4.166 2.083 2.083 0 0 1 0 4.166"
        />
      </svg>
      <mud-label>Cu pictogramă</mud-label>
    </mud-select-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 420px;
    }
  `,
})
export class SelectStatesExample {
  readonly raions: MudSelectOption<string>[] = [
    { value: 'chisinau', label: 'Chișinău' },
    { value: 'balti', label: 'Bălți' },
    { value: 'cahul', label: 'Cahul' },
  ];
}
