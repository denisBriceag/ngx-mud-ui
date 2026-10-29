import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-sizes',
  imports: [MudButton],
  template: `
    <div class="row">
      <button type="button" mudButton size="lg">Large</button>
      <button type="button" mudButton size="md">Medium</button>
      <button type="button" mudButton size="sm">Small</button>
    </div>
    <div class="row">
      <button type="button" mudButton shape="circular" size="lg">Large</button>
      <button type="button" mudButton shape="circular" size="md">Medium</button>
      <button type="button" mudButton shape="circular" size="sm">Small</button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
})
export class ButtonSizesExample {}
