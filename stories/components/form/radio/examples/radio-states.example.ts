import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';

@Component({
  selector: 'app-radio-states',
  imports: [MudRadioGroup, MudRadio, MudLabel, MudInlineMessage],
  template: `
    <mud-radio-group required invalid>
      <mud-label>Obligatoriu, cu eroare</mud-label>
      <mud-radio value="a"><mud-label>Opțiunea A</mud-label></mud-radio>
      <mud-radio value="b"><mud-label>Opțiunea B</mud-label></mud-radio>
      <mud-inline-message variant="error">Alegeți o opțiune.</mud-inline-message>
    </mud-radio-group>

    <mud-radio-group value="a" readonly>
      <mud-label>Doar citire</mud-label>
      <mud-radio value="a"><mud-label>Opțiunea A</mud-label></mud-radio>
      <mud-radio value="b"><mud-label>Opțiunea B</mud-label></mud-radio>
    </mud-radio-group>

    <mud-radio-group value="a" disabled>
      <mud-label>Dezactivat</mud-label>
      <mud-radio value="a"><mud-label>Opțiunea A</mud-label></mud-radio>
      <mud-radio value="b"><mud-label>Opțiunea B</mud-label></mud-radio>
    </mud-radio-group>

    <mud-radio-group value="a" size="small">
      <mud-label>Mic (small)</mud-label>
      <mud-radio value="a"><mud-label>Opțiunea A</mud-label></mud-radio>
      <mud-radio value="b"><mud-label>Opțiunea B</mud-label></mud-radio>
    </mud-radio-group>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
  `,
})
export class RadioStatesExample {}
