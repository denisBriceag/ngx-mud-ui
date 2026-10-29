import { Component } from '@angular/core';
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudPagination } from 'ngx-mud-ui/pagination';

@Component({
  selector: 'app-pagination-labels',
  imports: [MudPagination],
  providers: [
    provideMudLabels(MUD_LABELS_RO, { pagination: { previous: 'Înapoi' } }),
    provideMudFormatLocale('ro-MD'),
  ],
  template: `<mud-pagination [length]="200" [pageIndex]="4" />`,
})
export class PaginationLabelsExample {}
