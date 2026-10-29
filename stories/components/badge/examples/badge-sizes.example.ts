import { Component } from '@angular/core';
import { MudBadge } from 'ngx-mud-ui/badge';

@Component({
  selector: 'app-badge-sizes',
  imports: [MudBadge],
  template: `
    <div class="row">
      <mud-badge [count]="1" size="xl" />
      <mud-badge [count]="1" size="lg" />
      <mud-badge [count]="1" size="md" />
      <mud-badge [count]="1" size="sm" />
      <mud-badge type="dot" size="xs" />
    </div>
    <div class="row">
      <mud-badge type="dot" size="xl" />
      <mud-badge type="dot" size="lg" />
      <mud-badge type="dot" size="md" />
      <mud-badge type="dot" size="sm" />
      <mud-badge type="dot" size="xs" />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 32px;
    }
  `,
})
export class BadgeSizesExample {}
