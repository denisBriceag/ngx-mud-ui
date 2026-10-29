import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-button-link',
  imports: [MudButton],
  template: `
    <a mudButton href="https://egov.md" target="_blank" rel="noopener">Open egov.md</a>
    <a mudButton="outlined" href="https://egov.md" target="_blank" rel="noopener">Outlined link</a>
    <a mudButton href="https://egov.md" disabled>Disabled link</a>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
})
export class ButtonLinkExample {}
