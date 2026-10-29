import { Component } from '@angular/core';
import { MudLink } from 'ngx-mud-ui/link';

@Component({
  selector: 'app-link-touch-target',
  imports: [MudLink],
  template: `
    <div class="row">
      <a mudLink touchTarget="pointer" href="#">32px hit area</a>
      <a mudLink touchTarget="touch" href="#">40px hit area</a>
    </div>
    <p>
      In running text, use <a mudLink touchTarget="none" href="#">touchTarget="none"</a> so the link
      keeps the line height and doesn't overlap the lines around it.
    </p>
  `,
  styles: `
    .row {
      display: flex;
      gap: 24px;
    }
    .row a {
      outline: 1px dashed var(--mud-color-border-base-default);
    }
    p {
      max-width: 48ch;
    }
  `,
})
export class LinkTouchTargetExample {}
