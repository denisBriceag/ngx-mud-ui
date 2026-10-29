import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';
import { homeLine, provideMudIcons } from 'ngx-mud-ui/icons';

import { example } from '../../example';
import { BreadcrumbBasicExample } from './examples/breadcrumb-basic.example';
import basicSource from './examples/breadcrumb-basic.example.ts?raw';
import { BreadcrumbCollapsedExample } from './examples/breadcrumb-collapsed.example';
import collapsedSource from './examples/breadcrumb-collapsed.example.ts?raw';
import { BreadcrumbIconExample } from './examples/breadcrumb-icon.example';
import iconSource from './examples/breadcrumb-icon.example.ts?raw';
import { BreadcrumbLongLabelExample } from './examples/breadcrumb-long-label.example';
import longLabelSource from './examples/breadcrumb-long-label.example.ts?raw';
import { BreadcrumbNarrowExample } from './examples/breadcrumb-narrow.example';
import narrowSource from './examples/breadcrumb-narrow.example.ts?raw';
import { BreadcrumbStatesExample } from './examples/breadcrumb-states.example';
import statesSource from './examples/breadcrumb-states.example.ts?raw';

const meta: Meta<MudBreadcrumb> = {
  title: 'Components/Breadcrumb',
  component: MudBreadcrumb,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([homeLine])] }),
    moduleMetadata({ imports: [MudBreadcrumb, MudBreadcrumbItem] }),
  ],
  argTypes: { maxVisible: { control: { type: 'number', min: 2 } } },
  args: { maxVisible: 4, responsive: true },
};

export default meta;

type Story = StoryObj<MudBreadcrumb>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <nav mudBreadcrumb [maxVisible]="maxVisible" [responsive]="responsive">
        <ol>
          <li mudBreadcrumbItem><a href="#">Acasă</a></li>
          <li mudBreadcrumbItem><a href="#servicii">Servicii</a></li>
          <li mudBreadcrumbItem><a href="#acte">Acte de identitate</a></li>
          <li mudBreadcrumbItem><a href="#buletin">Buletin</a></li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    `,
  }),
};

export const Basic: Story = example(BreadcrumbBasicExample, basicSource);
export const Collapsed: Story = example(BreadcrumbCollapsedExample, collapsedSource);
export const LongLabel: Story = example(BreadcrumbLongLabelExample, longLabelSource);
export const Icon: Story = example(BreadcrumbIconExample, iconSource);
export const States: Story = example(BreadcrumbStatesExample, statesSource);
export const Narrow: Story = example(BreadcrumbNarrowExample, narrowSource);
