import { Component } from '@angular/core';
import { MudLink } from 'ngx-mud-ui/link';

@Component({
  selector: 'app-link-sizes',
  imports: [MudLink],
  template: `
    <a mudLink size="lg" href="#">Large</a>
    <a mudLink size="md" href="#">Medium</a>
    <a mudLink size="sm" href="#">Small</a>
    <a mudLink size="xs" href="#">Extra small</a>
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
