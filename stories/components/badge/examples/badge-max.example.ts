import { Component } from '@angular/core';
import { MudBadge } from 'ngx-mud-ui/badge';

@Component({
  selector: 'app-badge-max',
  imports: [MudBadge],
  template: `
    <mud-badge [count]="4" />
    <mud-badge [count]="99" />
    <mud-badge [count]="1204" />
    <mud-badge [count]="12" [max]="9" />
    <mud-badge [count]="3" disabled />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 32px;
    }
  `,
})
export class BadgeMaxExample {}
