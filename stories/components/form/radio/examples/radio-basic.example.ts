import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';

@Component({
  selector: 'app-radio-basic',
  imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage],
  template: `
    <mud-radio-group [(value)]="delivery">
      <mud-label>Cum doriți să primiți documentul?</mud-label>
      <mud-radio value="office"><mud-label>La ghișeu</mud-label></mud-radio>
      <mud-radio value="post">
        <mud-label>Prin poștă</mud-label>
        <mud-inline-message hideIcon>În 3–5 zile lucrătoare.</mud-inline-message>
      </mud-radio>
      <mud-radio value="mdelivery" disabled
        ><mud-label>MDelivery (indisponibil)</mud-label></mud-radio
      >
      <mud-inline-message hideIcon>Puteți schimba opțiunea până la emitere.</mud-inline-message>
    </mud-radio-group>
    <p>value: {{ delivery() ?? '—' }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class RadioBasicExample {
  readonly delivery = signal<string | undefined>('office');
}
