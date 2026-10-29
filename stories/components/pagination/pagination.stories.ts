import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudPagination } from 'ngx-mud-ui/pagination';

import { example } from '../../example';
import { PaginationBasicExample } from './examples/pagination-basic.example';
import basicSource from './examples/pagination-basic.example.ts?raw';
import { PaginationLabelsExample } from './examples/pagination-labels.example';
import labelsSource from './examples/pagination-labels.example.ts?raw';
import { PaginationServerExample } from './examples/pagination-server.example';
import serverSource from './examples/pagination-server.example.ts?raw';
import { PaginationSizesExample } from './examples/pagination-sizes.example';
import sizesSource from './examples/pagination-sizes.example.ts?raw';
import { PaginationTableExample } from './examples/pagination-table.example';
import tableSource from './examples/pagination-table.example.ts?raw';

const meta: Meta<MudPagination> = {
  title: 'Components/Pagination',
  component: MudPagination,
  decorators: [moduleMetadata({ imports: [MudPagination] })],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  args: { length: 200, pageSize: 10, pageIndex: 0, size: 'md', disabled: false },
};

export default meta;

type Story = StoryObj<MudPagination>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-pagination [length]="length" [pageSize]="pageSize" [(pageIndex)]="pageIndex" [size]="size" [disabled]="disabled" />
    `,
  }),
};

export const Basic: Story = example(PaginationBasicExample, basicSource);
export const Sizes: Story = example(PaginationSizesExample, sizesSource);
export const Table: Story = example(PaginationTableExample, tableSource);
export const Server: Story = example(PaginationServerExample, serverSource);
export const Labels: Story = example(PaginationLabelsExample, labelsSource);
