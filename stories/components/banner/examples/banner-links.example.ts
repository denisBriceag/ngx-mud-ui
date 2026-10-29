import { Component } from '@angular/core';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudLink } from 'ngx-mud-ui/link';

@Component({
  selector: 'app-banner-links',
  imports: [MudBanner, MudLink],
  template: `
    <mud-banner variant="warning">
      Scheduled maintenance tonight 22:00–00:00. <a mudLink href="#status">Details</a>
    </mud-banner>
    <mud-banner variant="info" type="strong">
      A new version of the portal is available.
      <a actions mudLink href="#news">What changed</a>
      <a actions mudLink href="#feedback">Send feedback</a>
    </mud-banner>
    <mud-banner variant="error" type="strong">
      Payments are currently unavailable.
      <a actions mudLink href="#status">Check the status</a>
    </mud-banner>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `,
})
export class BannerLinksExample {}
