import { Component } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

@Component({
  selector: 'app-search-input-shapes',
  imports: [MudSearchInput, MudLabel],
  template: `
    <mud-search-input placeholder="Rectangular, medium">
      <mud-label>Căutare</mud-label>
    </mud-search-input>
    <mud-search-input
      shape="circular"
      size="large"
      withButton
      placeholder="Circular, large, with a button"
    >
      <mud-label>Căutare</mud-label>
    </mud-search-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 480px;
    }
  `,
})
export class SearchInputShapesExample {}
