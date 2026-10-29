import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudTooltipPlacement } from 'ngx-mud-ui/tooltip';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

@Component({
  selector: 'app-tooltip-placements',
  imports: [MudButton, MudTooltip],
  template: `
    @for (placement of placements; track placement) {
      <button
        type="button"
        mudButton="outlined"
        size="small"
        [mudTooltip]="placement"
        [tooltipPlacement]="placement"
      >
        {{ placement }}
      </button>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(3, max-content);
      justify-content: center;
      gap: 16px 48px;
      padding: 64px 0;
    }
  `,
})
export class TooltipPlacementsExample {
  readonly placements: MudTooltipPlacement[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
    'left-top',
    'left-center',
    'left-bottom',
    'right-top',
    'right-center',
    'right-bottom',
  ];
}
