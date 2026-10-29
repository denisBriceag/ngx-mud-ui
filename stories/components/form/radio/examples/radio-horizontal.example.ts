import { Component } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';

@Component({
  selector: 'app-radio-horizontal',
  imports: [MudRadioGroup, MudRadio, MudLabel],
  template: `
    <mud-radio-group orientation="horizontal">
      <mud-label>Aveți copii minori?</mud-label>
      <mud-radio value="yes"><mud-label>Da</mud-label></mud-radio>
      <mud-radio value="no"><mud-label>Nu</mud-label></mud-radio>
    </mud-radio-group>
  `,
})
export class RadioHorizontalExample {}
