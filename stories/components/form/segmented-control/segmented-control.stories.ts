import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { bulletList, dotGrid, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';

import { example } from '../../../example';
import { SegmentedControlBasicExample } from './examples/segmented-control-basic.example';
import basicSource from './examples/segmented-control-basic.example.ts?raw';
import { SegmentedControlFormsExample } from './examples/segmented-control-forms.example';
import formsSource from './examples/segmented-control-forms.example.ts?raw';
import { SegmentedControlLongLabelsExample } from './examples/segmented-control-long-labels.example';
import longLabelsSource from './examples/segmented-control-long-labels.example.ts?raw';
import { SegmentedControlSizesExample } from './examples/segmented-control-sizes.example';
import sizesSource from './examples/segmented-control-sizes.example.ts?raw';

const meta: Meta<MudSegmentedControl<string>> = {
  title: 'Components/Form/Segmented Control',
  component: MudSegmentedControl,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([bulletList, dotGrid])] }),
    moduleMetadata({ imports: [MudSegmentedControl, MudSegment] }),
  ],
  argTypes: { size: { control: 'inline-radio', options: ['medium', 'small'] } },
  args: { size: 'medium', fullWidth: false, disabled: false },
};

export default meta;

type Story = StoryObj<MudSegmentedControl<string>>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-segmented-control aria-label="Perioadă" value="day" [size]="size" [fullWidth]="fullWidth" [disabled]="disabled">
        <button mud-segment value="day">Zi</button>
        <button mud-segment value="week">Săptămână</button>
        <button mud-segment value="month">Lună</button>
      </mud-segmented-control>
    `,
  }),
};

export const Basic: Story = example(SegmentedControlBasicExample, basicSource);
export const Sizes: Story = example(SegmentedControlSizesExample, sizesSource);
export const LongLabels: Story = example(SegmentedControlLongLabelsExample, longLabelsSource);
export const Forms: Story = example(SegmentedControlFormsExample, formsSource);
