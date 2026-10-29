import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-disabled',
  imports: [MudButton],
  template: `
    <button type="button" mudButton disabled>Filled</button>
    <button type="button" mudButton="outlined" disabled>Outlined</button>
    <button type="button" mudButton="text" disabled>Text</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
})
export class ButtonDisabledExample {}
