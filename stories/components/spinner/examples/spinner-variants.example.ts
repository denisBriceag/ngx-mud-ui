import { Component } from '@angular/core';
import { MudSpinner } from 'ngx-mud-ui/spinner';

@Component({
  selector: 'app-spinner-variants',
  imports: [MudSpinner],
  template: `
    <div class="tile"><mud-spinner variant="brand" /></div>
    <div class="tile"><mud-spinner variant="dark" /></div>
    <div class="tile tile--inverse"><mud-spinner variant="light" /></div>
    <div class="tile tile--brand"><mud-spinner variant="light-on-color" /></div>
  `,
  styles: `
    :host {
      display: flex;
      gap: 16px;
    }
    .tile {
      display: grid;
      place-items: center;
      width: 80px;
      height: 80px;
      border-radius: 8px;
      background: var(--mud-color-background-base-secondary);
    }
    .tile--inverse {
      background: var(--mud-color-background-base-inverse-default);
    }
    .tile--brand {
      background: var(--mud-color-background-brand-default);
    }
  `,
})
export class SpinnerVariantsExample {}
