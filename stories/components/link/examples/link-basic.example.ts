import { Component } from '@angular/core';
import { MudLink } from 'ngx-mud-ui/link';

@Component({
  selector: 'app-link-basic',
  imports: [MudLink],
  template: `
    <div class="row">
      <a mudLink href="#servicii">Primary</a>
      <a mudLink="strict" href="#termeni">Strict</a>
      <a mudLink href="#arhiva" disabled>Disabled</a>
    </div>
    <div class="row">
      <a mudLink href="#a">Always underlined</a>
      <a mudLink underline="hover" href="#b">Underline on hover</a>
      <a mudLink underline="none" href="#c">No underline</a>
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
      gap: 24px;
    }
  `,
})
export class LinkBasicExample {}
