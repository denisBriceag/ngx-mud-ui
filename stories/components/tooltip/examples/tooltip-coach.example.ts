import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudTooltipCloseReason } from 'ngx-mud-ui/tooltip';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

@Component({
  selector: 'app-tooltip-coach',
  imports: [MudButton, MudTooltip],
  template: `
    <button
      type="button"
      mudButton="outlined"
      mudTooltip="Filter requests by status, date or service."
      tooltipTitle="New: filters"
      tooltipVariant="coach"
      tooltipTrigger="click"
      tooltipPlacement="bottom-left"
      (tooltipClosed)="closedBy.set($event)"
    >
      Filters
    </button>
    <p>Closed by: {{ closedBy() ?? '—' }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class TooltipCoachExample {
  readonly closedBy = signal<MudTooltipCloseReason | null>(null);
}
