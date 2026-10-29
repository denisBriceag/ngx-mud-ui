import { Component, signal } from '@angular/core';
import { MudPagination } from 'ngx-mud-ui/pagination';

interface Request {
  id: number;
  title: string;
}

@Component({
  selector: 'app-pagination-server',
  imports: [MudPagination],
  template: `
    <ul [attr.aria-busy]="loading()">
      @for (request of requests(); track request.id) {
        <li>#{{ request.id }} {{ request.title }}</li>
      }
    </ul>
    <mud-pagination
      [length]="total()"
      [pageSize]="pageSize"
      [disabled]="loading()"
      (page)="load($event.pageIndex)"
    />
  `,
  styles: `
    ul {
      min-height: 120px;
      margin: 0 0 16px;
      padding-left: 20px;
    }
  `,
})
export class PaginationServerExample {
  readonly pageSize = 5;
  readonly total = signal(0);
  readonly requests = signal<Request[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.load(0);
  }

  load(pageIndex: number): void {
    this.loading.set(true);
    // Stands in for an HTTP call that returns one page and the total count.
    setTimeout(() => {
      const first = pageIndex * this.pageSize + 1;

      this.requests.set(
        Array.from({ length: this.pageSize }, (_, i) => ({
          id: first + i,
          title: 'Cerere de eliberare a certificatului',
        })),
      );
      this.total.set(63);
      this.loading.set(false);
    }, 400);
  }
}
