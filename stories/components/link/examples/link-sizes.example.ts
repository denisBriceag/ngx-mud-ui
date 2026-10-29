import { Component } from '@angular/core';
import { MudLink } from 'ngx-mud-ui/link';

@Component({
  selector: 'app-link-sizes',
  imports: [MudLink],
  template: `
    <a mudLink size="large" href="#">Large</a>
    <a mudLink size="medium" href="#">Medium</a>
    <a mudLink size="small" href="#">Small</a>
    <a mudLink size="extra-small" href="#">Extra small</a>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 24px;
    }
  `,
})
export class LinkSizesExample {}
