import { Component } from '@angular/core';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icon is registered once in app.config.ts: provideMudIcons([alarm])
@Component({
  selector: 'app-banner-icon',
  imports: [MudBanner, MudIconComponent],
  template: `
    <mud-banner variant="warning">
      <mud-icon name="alarm" />
      Your session expires at 18:30.
    </mud-banner>
  `,
})
export class BannerIconExample {}
