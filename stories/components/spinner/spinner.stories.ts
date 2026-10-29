import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudSpinner } from 'ngx-mud-ui/spinner';

import { example } from '../../example';
import { SpinnerBasicExample } from './examples/spinner-basic.example';
import basicSource from './examples/spinner-basic.example.ts?raw';
import { SpinnerLoadingExample } from './examples/spinner-loading.example';
import loadingSource from './examples/spinner-loading.example.ts?raw';
import { SpinnerVariantsExample } from './examples/spinner-variants.example';
import variantsSource from './examples/spinner-variants.example.ts?raw';

const meta: Meta<MudSpinner> = {
  title: 'Components/Spinner',
  component: MudSpinner,
  decorators: [moduleMetadata({ imports: [MudSpinner] })],
  argTypes: {
    size: { control: 'inline-radio', options: ['extra-small', 'small', 'medium', 'large'] },
    variant: { control: 'inline-radio', options: ['brand', 'dark', 'light', 'light-on-color'] },
  },
  args: { size: 'medium', variant: 'brand' },
};

export default meta;

type Story = StoryObj<MudSpinner>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<mud-spinner [size]="size" [variant]="variant" />`,
  }),
};

export const Sizes: Story = example(SpinnerBasicExample, basicSource);
export const Variants: Story = example(SpinnerVariantsExample, variantsSource);
export const Loading: Story = example(SpinnerLoadingExample, loadingSource);
