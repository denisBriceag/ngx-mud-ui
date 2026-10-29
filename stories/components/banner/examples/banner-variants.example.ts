import { Component } from '@angular/core';
import { MudBanner } from 'ngx-mud-ui/banner';

@Component({
  selector: 'app-banner-variants',
  imports: [MudBanner],
  template: `
    <mud-banner variant="info">A new version of the portal is available.</mud-banner>
    <mud-banner variant="warning">Scheduled maintenance tonight 22:00–00:00.</mud-banner>
    <mud-banner variant="error">Payments are currently unavailable.</mud-banner>
    <mud-banner variant="info" type="strong">A new version of the portal is available.</mud-banner>
    <mud-banner variant="warning" type="strong"
      >Scheduled maintenance tonight 22:00–00:00.</mud-banner
    >
    <mud-banner variant="error" type="strong">Payments are currently unavailable.</mud-banner>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `,
})
export class BannerVariantsExample {}
