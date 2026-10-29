import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSwitch } from 'ngx-mud-ui/switch';

import { example } from '../../../example';
import { SwitchBasicExample } from './examples/switch-basic.example';
import basicSource from './examples/switch-basic.example.ts?raw';
import { SwitchReactiveExample } from './examples/switch-reactive.example';
import reactiveSource from './examples/switch-reactive.example.ts?raw';
import { SwitchSignalFormsExample } from './examples/switch-signal-forms.example';
import signalFormsSource from './examples/switch-signal-forms.example.ts?raw';

const meta: Meta<MudSwitch> = {
  title: 'Components/Form/Switch',
  component: MudSwitch,
  decorators: [moduleMetadata({ imports: [MudSwitch, MudLabel] })],
  args: { checked: false, disabled: false },
};

export default meta;

type Story = StoryObj<MudSwitch>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<mud-switch [(checked)]="checked" [disabled]="disabled"><mud-label>Notificări prin e-mail</mud-label></mud-switch>`,
  }),
};

export const Basic: Story = example(SwitchBasicExample, basicSource);
export const ReactiveForms: Story = example(SwitchReactiveExample, reactiveSource);
export const SignalForms: Story = example(SwitchSignalFormsExample, signalFormsSource);
