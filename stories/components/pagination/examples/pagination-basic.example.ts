import { Component, signal } from '@angular/core';
import type { MudPageEvent } from 'ngx-mud-ui/pagination';
import { MudPagination } from 'ngx-mud-ui/pagination';

@Component({
  selector: 'app-pagination-basic',
  imports: [MudPagination],
  template: `
    <mud-pagination
      [length]="200"
      [pageSize]="10"
      [(pageIndex)]="pageIndex"
      (page)="lastEvent.set($event)"
    />
    <p>
      pageIndex: {{ pageIndex() }} · last event:
      {{ lastEvent() ? lastEvent()!.previousPageIndex + ' → ' + lastEvent()!.pageIndex : 'none' }}
    </p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class PaginationBasicExample {
  // Zero-based: page 5 on screen.
  readonly pageIndex = signal(4);
  readonly lastEvent = signal<MudPageEvent | null>(null);
}
