import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudLink } from 'ngx-mud-ui/link';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

@Component({
  selector: 'app-tooltip-interactive',
  imports: [MudButton, MudLink, MudTooltip],
  template: `
    <p>
      Pay the
      <a
        mudLink
        touchTarget="none"
        href="#fee"
        mudTooltip="50 lei, paid with MPay before you submit."
        tooltipInteractive
      >
        state fee
      </a>
      before you submit the request.
    </p>
    <button
      type="button"
      mudButton="text"
      mudTooltip="The 13-digit number on your ID card."
      tooltipTrigger="click"
      tooltipClosable
    >
      What is the IDNP?
    </button>
  `,
  styles: `
    :host {
      display: block;
      padding-top: 48px;
    }
  `,
})
export class TooltipInteractiveExample {}
