import { Component } from '@angular/core';
import { MudPagination } from 'ngx-mud-ui/pagination';

@Component({
  selector: 'app-pagination-sizes',
  imports: [MudPagination],
  template: `
    <mud-pagination [length]="70" [pageIndex]="3" />
    <mud-pagination [length]="70" [pageIndex]="3" size="small" />
    <mud-pagination [length]="70" [pageIndex]="3" disabled />
    <div class="card">
      <mud-pagination [length]="200" [pageIndex]="4" size="small" />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .card {
      width: 320px;
      max-width: 100%;
      padding: 12px;
      border: 1px dashed var(--mud-color-border-base-default);
    }
    .card mud-pagination {
      justify-content: center;
    }
  `,
})
export class PaginationSizesExample {}
