import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';

import { example } from '../../example';
import { StepperBasicExample } from './examples/stepper-basic.example';
import basicSource from './examples/stepper-basic.example.ts?raw';
import { StepperIndicatorExample } from './examples/stepper-indicator.example';
import indicatorSource from './examples/stepper-indicator.example.ts?raw';
import { StepperLayoutExample } from './examples/stepper-layout.example';
import layoutSource from './examples/stepper-layout.example.ts?raw';
import { StepperReactiveExample } from './examples/stepper-reactive.example';
import reactiveSource from './examples/stepper-reactive.example.ts?raw';
import { StepperSignalFormsExample } from './examples/stepper-signal-forms.example';
import signalFormsSource from './examples/stepper-signal-forms.example.ts?raw';
import { StepperStatesExample } from './examples/stepper-states.example';
import statesSource from './examples/stepper-states.example.ts?raw';
import { StepperStepClickExample } from './examples/stepper-step-click.example';
import stepClickSource from './examples/stepper-step-click.example.ts?raw';

const meta: Meta<MudStepper> = {
  title: 'Components/Stepper',
  component: MudStepper,
  decorators: [moduleMetadata({ imports: [MudStepper, MudStep] })],
  args: { compact: false },
};

export default meta;

type Story = StoryObj<MudStepper>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-stepper [compact]="compact">
        <mud-step label="Date personale" supportingText="Cine sunteți"><p>Pasul 1.</p></mud-step>
        <mud-step label="Adresa"><p>Pasul 2.</p></mud-step>
        <mud-step label="Confirmare"><p>Pasul 3.</p></mud-step>
      </mud-stepper>
    `,
  }),
};

export const Basic: Story = example(StepperBasicExample, basicSource);
export const States: Story = example(StepperStatesExample, statesSource);
export const ReactiveForms: Story = example(StepperReactiveExample, reactiveSource);
export const SignalForms: Story = example(StepperSignalFormsExample, signalFormsSource);
export const StepClick: Story = example(StepperStepClickExample, stepClickSource);
export const Layout: Story = example(StepperLayoutExample, layoutSource);
export const Indicator: Story = example(StepperIndicatorExample, indicatorSource);
