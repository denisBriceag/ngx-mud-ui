import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { lightBulb, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudInfoBox } from 'ngx-mud-ui/info-box';

import { example } from '../../example';
import { InfoBoxActionsExample } from './examples/info-box-actions.example';
import actionsSource from './examples/info-box-actions.example.ts?raw';
import { InfoBoxClosableExample } from './examples/info-box-closable.example';
import closableSource from './examples/info-box-closable.example.ts?raw';
import { InfoBoxIconExample } from './examples/info-box-icon.example';
import iconSource from './examples/info-box-icon.example.ts?raw';
import { InfoBoxVariantsExample } from './examples/info-box-variants.example';
import variantsSource from './examples/info-box-variants.example.ts?raw';

const meta: Meta<MudInfoBox> = {
  title: 'Components/Info box',
  component: MudInfoBox,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([lightBulb])] }),
    moduleMetadata({ imports: [MudInfoBox] }),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['neutral', 'moderate', 'warning', 'error'] },
    emphasis: { control: 'inline-radio', options: ['subtle', 'strong'] },
  },
  args: { variant: 'neutral', emphasis: 'subtle', closable: false, hideIcon: false },
};

export default meta;

type Story = StoryObj<MudInfoBox>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-info-box [variant]="variant" [emphasis]="emphasis" [closable]="closable" [hideIcon]="hideIcon">
        <p heading>Before you begin</p>
        You will need your IDNP and a valid email address.
      </mud-info-box>
    `,
  }),
};

export const Variants: Story = example(InfoBoxVariantsExample, variantsSource);
export const Actions: Story = example(InfoBoxActionsExample, actionsSource);
export const Closable: Story = example(InfoBoxClosableExample, closableSource);
export const Icon: Story = example(InfoBoxIconExample, iconSource);
