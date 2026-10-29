import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-variants',
  imports: [MudButton],
  template: `
    <div class="row">
      <button type="button" mudButton>Primary</button>
      <button type="button" mudButton color="secondary">Secondary</button>
      <button type="button" mudButton color="strict">Strict</button>
      <button type="button" mudButton color="neutral">Neutral</button>
      <button type="button" mudButton color="destructive">Destructive</button>
    </div>
    <div class="row">
      <button type="button" mudButton="outlined">Primary</button>
      <button type="button" mudButton="outlined" color="strict">Strict</button>
      <button type="button" mudButton="outlined" color="destructive">Destructive</button>
    </div>
    <div class="row">
      <button type="button" mudButton="text">Primary</button>
      <button type="button" mudButton="text" color="strict">Strict</button>
      <button type="button" mudButton="text" color="destructive">Destructive</button>
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
      gap: 16px;
    }
  `,
})
export class ButtonVariantsExample {}
