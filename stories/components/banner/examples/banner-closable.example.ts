import { Component, signal } from '@angular/core';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-banner-closable',
  imports: [MudBanner, MudButton],
  template: `
    @if (visible()) {
      <mud-banner variant="info" closable (closed)="visible.set(false)">
        You can now sign documents with MSign from your phone.
      </mud-banner>
    } @else {
      <button type="button" mudButton="outlined" size="small" (click)="visible.set(true)">
        Show the banner again
      </button>
    }
  `,
})
export class BannerClosableExample {
  readonly visible = signal(true);
}
