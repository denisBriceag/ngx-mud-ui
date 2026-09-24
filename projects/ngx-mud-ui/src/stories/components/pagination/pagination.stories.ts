import { afterNextRender, Component, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudPagination, provideMudPaginationLabels } from 'ngx-mud-ui/pagination';
import type { MudPaginationLabels, MudPaginationSize } from 'ngx-mud-ui/pagination';
import {
  MudCell,
  MudCellDef,
  MudColumnDef,
  MudHeaderCell,
  MudHeaderCellDef,
  MudHeaderRow,
  MudHeaderRowDef,
  MudRow,
  MudRowDef,
  MudSort,
  MudSortHeader,
  MudTable,
  MudTableDataSource,
} from 'ngx-mud-ui/table';

interface PlaygroundArgs {
  length: number;
  pageSize: number;
  pageIndex: number;
  disabled: boolean;
  size: MudPaginationSize;
  'aria-label': string;
}

const playgroundSource = (args: PlaygroundArgs): string => `import { Component, signal } from '@angular/core';
import { MudPagination, type MudPageEvent } from 'ngx-mud-ui/pagination';

@Component({
  selector: 'app-results',
  imports: [MudPagination],
  template: \`
    <mud-pagination
      [length]="${args.length}"
      [pageSize]="${args.pageSize}"
      [(pageIndex)]="pageIndex"
      [disabled]="${args.disabled}"
      size="${args.size}"
      aria-label="${args['aria-label']}"
      (page)="load($event)"
    />
  \`,
})
export class ResultsComponent {
  readonly pageIndex = signal(${args.pageIndex});
  load(event: MudPageEvent) { /* fetch page event.pageIndex */ }
}`;

const meta: Meta<MudPagination> = {
  title: 'Components/Pagination',
  component: MudPagination,
  decorators: [moduleMetadata({ imports: [MudPagination] })],
  argTypes: {
    length: { control: { type: 'number', min: 0 } },
    pageSize: { control: { type: 'number', min: 1 } },
    pageIndex: { control: { type: 'number', min: 0 } },
    disabled: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['small', 'medium'] },
    'aria-label': { control: 'text' },
  } as Meta<MudPagination>['argTypes'],
  args: {
    length: 200,
    pageSize: 10,
    pageIndex: 4,
    disabled: false,
    size: 'medium',
    'aria-label': 'Pagination',
  } as Meta<MudPagination>['args'],
};

export default meta;

type Story = StoryObj<MudPagination>;

/** Every input bound — drop the length to 50 and the overflows disappear. */
export const Playground: Story = {
  parameters: {
    docs: { source: { language: 'ts', transform: (_c: string, ctx: { args: PlaygroundArgs }) => playgroundSource(ctx.args) } },
  },
  render: (args) => {
    const a = args as unknown as PlaygroundArgs;

    return {
      props: { ...a, label: a['aria-label'] },
      template: `
        <mud-pagination
          [length]="length"
          [pageSize]="pageSize"
          [(pageIndex)]="pageIndex"
          [disabled]="disabled"
          [size]="size"
          [aria-label]="label"
        />
      `,
    };
  },
};

/** Both rungs: 40px with Prev/Next text, 32px icon-only. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:grid;gap:24px">
        <mud-pagination [length]="200" [pageIndex]="4" />
        <mud-pagination [length]="200" [pageIndex]="4" size="small" />
      </div>
    `,
  }),
};

/** Seven pages or fewer: every page is shown, no overflow. One page renders nothing. */
export const FewPages: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:grid;gap:24px">
        <mud-pagination [length]="70" [pageIndex]="3" />
        <mud-pagination [length]="30" [pageIndex]="0" />
        <mud-pagination [length]="8" />
      </div>
    `,
  }),
};

/** The Figma windowing rules, one row per case. Open a `…` to jump into the collapsed range. */
export const ManyPages: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:grid;gap:24px">
        <mud-pagination [length]="200" [pageIndex]="0" />
        <mud-pagination [length]="200" [pageIndex]="4" />
        <mud-pagination [length]="200" [pageIndex]="9" />
        <mud-pagination [length]="200" [pageIndex]="16" />
        <mud-pagination [length]="200" [pageIndex]="19" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({ template: `<mud-pagination [length]="200" [pageIndex]="9" disabled />` }),
};

/** Drag the box's corner: below the 7-slot width it drops to 5 slots. */
export const NarrowContainer: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="resize:horizontal;overflow:auto;inline-size:520px;max-inline-size:100%;padding:12px;border:1px dashed var(--color-border-base-default)">
        <mud-pagination [length]="200" [pageIndex]="9" />
      </div>
    `,
  }),
};

const RO_LABELS: Partial<MudPaginationLabels> = {
  navigation: 'Navigare pagini',
  previous: 'Anterior',
  next: 'Următor',
  previousAria: (page) => `Pagina anterioară, mergi la pagina ${page}`,
  nextAria: (page) => `Pagina următoare, mergi la pagina ${page}`,
  pageAria: (page, total) => `Pagina ${page} din ${total}`,
  overflowAria: (from, to) => `Arată paginile de la ${from} la ${to}`,
};

/** Romanian strings through provideMudPaginationLabels — one call localizes every paginator. */
export const LocalizedLabels: Story = {
  parameters: { controls: { disable: true } },
  decorators: [applicationConfig({ providers: [provideMudPaginationLabels(RO_LABELS)] })],
  render: () => ({ template: `<mud-pagination [length]="200" [pageIndex]="9" />` }),
};

interface Cerere {
  id: number;
  nume: string;
  suma: number;
}

const CERERI: Cerere[] = Array.from({ length: 47 }, (_v, i) => ({
  id: i + 1,
  nume: ['Ana Rusu', 'Ion Ceban', 'Maria Popescu', 'Victor Lungu', 'Elena Cojocaru'][i % 5],
  suma: ((i * 37) % 900) + 100,
}));

@Component({
  selector: 'mud-pagination-story-table',
  imports: [
    MudTable,
    MudColumnDef,
    MudHeaderCellDef,
    MudCellDef,
    MudHeaderCell,
    MudCell,
    MudHeaderRowDef,
    MudRowDef,
    MudHeaderRow,
    MudRow,
    MudSort,
    MudSortHeader,
    MudPagination,
  ],
  template: `
    <div class="mud-data-table-container">
      <table mud-table [dataSource]="source" mudSort (sortChange)="paginator().firstPage()" aria-label="Cereri depuse">
        <ng-container mudColumnDef="id">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nr.</th>
          <td mud-cell *mudCellDef="let row">{{ row.id }}</td>
        </ng-container>
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Suma</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    </div>
    <mud-pagination [pageSize]="5" style="justify-content:flex-end;margin-block-start:16px" />
  `,
})
class PagedTable {
  readonly columns = ['id', 'nume', 'suma'];
  readonly source = new MudTableDataSource(CERERI);
  readonly sort = viewChild.required(MudSort);
  readonly paginator = viewChild.required(MudPagination);

  constructor() {
    afterNextRender(() => {
      this.source.sort = this.sort();
      this.source.paginator = this.paginator();
    });
  }
}

// "Show code" for WithTable: the PagedTable host above as a pasteable app component. Keep the two in sync.
const WITH_TABLE_SOURCE = `import { afterNextRender, Component, viewChild } from '@angular/core';
import { MudPagination } from 'ngx-mud-ui/pagination';
import {
  MudCell,
  MudCellDef,
  MudColumnDef,
  MudHeaderCell,
  MudHeaderCellDef,
  MudHeaderRow,
  MudHeaderRowDef,
  MudRow,
  MudRowDef,
  MudSort,
  MudSortHeader,
  MudTable,
  MudTableDataSource,
} from 'ngx-mud-ui/table';

interface Cerere {
  id: number;
  nume: string;
  suma: number;
}

const CERERI: Cerere[] = Array.from({ length: 47 }, (_v, i) => ({
  id: i + 1,
  nume: ['Ana Rusu', 'Ion Ceban', 'Maria Popescu', 'Victor Lungu', 'Elena Cojocaru'][i % 5],
  suma: ((i * 37) % 900) + 100,
}));

@Component({
  selector: 'app-cereri',
  imports: [
    MudTable,
    MudColumnDef,
    MudHeaderCellDef,
    MudCellDef,
    MudHeaderCell,
    MudCell,
    MudHeaderRowDef,
    MudRowDef,
    MudHeaderRow,
    MudRow,
    MudSort,
    MudSortHeader,
    MudPagination,
  ],
  template: \`
    <div class="mud-data-table-container">
      <!-- re-sorting goes back to page 1; drop the handler to keep the current page -->
      <table mud-table [dataSource]="source" mudSort (sortChange)="paginator().firstPage()" aria-label="Cereri depuse">
        <ng-container mudColumnDef="id">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nr.</th>
          <td mud-cell *mudCellDef="let row">{{ row.id }}</td>
        </ng-container>
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Suma</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    </div>
    <!-- the host is a block-level flex container: justify-content aligns the paginator -->
    <mud-pagination [pageSize]="5" style="justify-content: flex-end; margin-block-start: 16px" />
  \`,
})
export class CereriComponent {
  readonly columns = ['id', 'nume', 'suma'];
  // Sorts, then slices one page; it also keeps the paginator's length up to date.
  readonly source = new MudTableDataSource(CERERI);
  readonly sort = viewChild.required(MudSort);
  readonly paginator = viewChild.required(MudPagination);

  constructor() {
    // viewChild resolves after the first render, so hand both over then.
    afterNextRender(() => {
      this.source.sort = this.sort();
      this.source.paginator = this.paginator();
    });
  }
}`;

/** The table recipe: sort, then page. Re-sorting jumps back to page 1 via `(sortChange)`. */
export const WithTable: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: WITH_TABLE_SOURCE, language: 'ts' } } },
  decorators: [moduleMetadata({ imports: [PagedTable] })],
  render: () => ({ template: `<mud-pagination-story-table />` }),
};
