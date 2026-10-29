import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

// The icon is registered once in app.config.ts: provideMudIcons([filter])
@Component({
  selector: 'app-search-input-states',
  imports: [MudSearchInput, MudLabel, MudInlineMessage, MudIconComponent],
  template: `
    <mud-search-input value="pașaport">
      <mud-label>With a trailing icon</mud-label>
      <mud-icon icon-end name="filter" [scale]="20" />
    </mud-search-input>
    <mud-search-input loading value="pașaport">
      <mud-label>Loading</mud-label>
    </mud-search-input>
    <mud-search-input invalid value="x">
      <mud-label>Invalid</mud-label>
      <mud-inline-message variant="error">Scrieți cel puțin 2 caractere.</mud-inline-message>
    </mud-search-input>
    <mud-search-input disabled>
      <mud-label>Disabled</mud-label>
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
export class SearchInputStatesExample {}
