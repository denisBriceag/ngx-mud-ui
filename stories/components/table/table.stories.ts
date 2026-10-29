import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { edit, provideMudIcons } from 'ngx-mud-ui/icons';
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
  MudTable,
} from 'ngx-mud-ui/table';

import { example } from '../../example';
import { fakeCereriApi } from './examples/table-http.example';
import { fakeCereriPageApi } from './examples/table-server-paging.example';
import { TableEmptyExample } from './examples/table-empty.example';
import emptySource from './examples/table-empty.example.ts?raw';
import { TableFlexExample } from './examples/table-flex.example';
import flexSource from './examples/table-flex.example.ts?raw';
import { TableFooterExample } from './examples/table-footer.example';
import footerSource from './examples/table-footer.example.ts?raw';
import { TableHeaderStylesExample } from './examples/table-header-styles.example';
import headerStylesSource from './examples/table-header-styles.example.ts?raw';
import { TableHttpExample } from './examples/table-http.example';
import httpSource from './examples/table-http.example.ts?raw';
import { TablePaginatedExample } from './examples/table-paginated.example';
import paginatedSource from './examples/table-paginated.example.ts?raw';
import { TableRowActionsExample } from './examples/table-row-actions.example';
import rowActionsSource from './examples/table-row-actions.example.ts?raw';
import { TableRowStylesExample } from './examples/table-row-styles.example';
import rowStylesSource from './examples/table-row-styles.example.ts?raw';
import { TableSelectionExample } from './examples/table-selection.example';
import selectionSource from './examples/table-selection.example.ts?raw';
import { TableServerPagingExample } from './examples/table-server-paging.example';
import serverPagingSource from './examples/table-server-paging.example.ts?raw';
import { TableSortExample } from './examples/table-sort.example';
import sortSource from './examples/table-sort.example.ts?raw';
import { TableStatusTagsExample } from './examples/table-status-tags.example';
import statusTagsSource from './examples/table-status-tags.example.ts?raw';
import { TableStickyExample } from './examples/table-sticky.example';
import stickySource from './examples/table-sticky.example.ts?raw';

const meta: Meta<MudTable<unknown>> = {
  title: 'Components/Table',
  component: MudTable,
  decorators: [
    // The HTTP examples' fake backends are registered here, as an app would in app.config.ts.
    applicationConfig({
      providers: [
        provideMudIcons([edit]),
        provideHttpClient(withInterceptors([fakeCereriApi, fakeCereriPageApi])),
      ],
    }),
    moduleMetadata({
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
      ],
    }),
  ],
  argTypes: {
    headerStyle: { control: 'inline-radio', options: ['subtle', 'strong', 'white'] },
    rowStyle: { control: 'inline-radio', options: ['default', 'zebra'] },
  },
  args: { headerStyle: 'subtle', rowStyle: 'default', hoverable: false },
};

export default meta;

type Story = StoryObj<MudTable<unknown>>;

export const Playground: Story = {
  render: (args) => ({
    props: {
      ...args,
      columns: ['nume', 'localitate', 'suma'],
      rows: [
        { nume: 'Ana Rusu', localitate: 'Chișinău', suma: 250 },
        { nume: 'Ion Ceban', localitate: 'Bălți', suma: 1200 },
        { nume: 'Maria Popescu', localitate: 'Cahul', suma: 80 },
      ],
    },
    template: `
      <table mud-table [dataSource]="rows" [headerStyle]="headerStyle" [rowStyle]="rowStyle" [hoverable]="hoverable" aria-label="Cereri">
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef>Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="localitate">
          <th mud-header-cell *mudHeaderCellDef>Localitate</th>
          <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef>Suma (MDL)</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    `,
  }),
};

export const Sort: Story = example(TableSortExample, sortSource);
export const HeaderStyles: Story = example(TableHeaderStylesExample, headerStylesSource);
export const RowStyles: Story = example(TableRowStylesExample, rowStylesSource);
export const Http: Story = example(TableHttpExample, httpSource);
export const Paginated: Story = example(TablePaginatedExample, paginatedSource);
export const ServerPaging: Story = example(TableServerPagingExample, serverPagingSource);
export const Sticky: Story = example(TableStickyExample, stickySource);
export const Footer: Story = example(TableFooterExample, footerSource);
export const Empty: Story = example(TableEmptyExample, emptySource);
export const Flex: Story = example(TableFlexExample, flexSource);
export const Selection: Story = example(TableSelectionExample, selectionSource);
export const StatusTags: Story = example(TableStatusTagsExample, statusTagsSource);
export const RowActions: Story = example(TableRowActionsExample, rowActionsSource);
