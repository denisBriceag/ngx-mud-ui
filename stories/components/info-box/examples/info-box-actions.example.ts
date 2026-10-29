import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudInfoBox } from 'ngx-mud-ui/info-box';
import { MudLink } from 'ngx-mud-ui/link';

@Component({
  selector: 'app-info-box-actions',
  imports: [MudInfoBox, MudButton, MudLink],
  template: `
    <mud-info-box variant="moderate" emphasis="strong">
      <p heading>Your session is about to expire</p>
      You will be signed out in two minutes.
      <button actions type="button" mudButton size="sm">Stay signed in</button>
      <a actions mudLink href="#help">What does this mean?</a>
    </mud-info-box>
  `,
})
export class InfoBoxActionsExample {}
