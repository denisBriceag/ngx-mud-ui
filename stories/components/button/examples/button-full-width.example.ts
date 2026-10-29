import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-full-width',
  imports: [MudButton],
  template: `
    <button type="submit" mudButton fullWidth>Continue</button>
    <button type="button" mudButton="outlined" fullWidth>Back</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 320px;
    }
  `,
})
export class ButtonFullWidthExample {}
