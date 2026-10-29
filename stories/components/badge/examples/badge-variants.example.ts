import { Component } from '@angular/core';
import type { MudBadgeVariant } from 'ngx-mud-ui/badge';
import { MudBadge } from 'ngx-mud-ui/badge';

@Component({
  selector: 'app-badge-variants',
  imports: [MudBadge],
  template: `
    @for (variant of variants; track variant) {
      <div class="cell" [class.cell--inverse]="variant === 'light'">
        <mud-badge [count]="1" [variant]="variant" />
        <code>{{ variant }}</code>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
    }
    .cell--inverse {
      background: var(--mud-color-background-base-inverse-default);
      color: var(--mud-color-text-base-inverse-default);
    }
  `,
})
export class BadgeVariantsExample {
  readonly variants: MudBadgeVariant[] = [
    'default',
    'brand',
    'positive',
    'warning',
    'danger',
    'dark',
    'light',
    'neutral',
    'accent',
  ];
}
