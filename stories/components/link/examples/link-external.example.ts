import { Component } from '@angular/core';
import { MudLink } from 'ngx-mud-ui/link';

@Component({
  selector: 'app-link-external',
  imports: [MudLink],
  template: `
    <a mudLink href="https://egov.md" target="_blank">egov.md</a>
    <a mudLink href="https://egov.md" target="_blank" [external]="false"
      >egov.md, without the icon</a
    >
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
  `,
})
export class LinkExternalExample {}
