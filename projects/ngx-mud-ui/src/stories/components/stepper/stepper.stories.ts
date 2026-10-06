import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudIndicatorStep, MudStepper, MudStep, MudStepIndicator } from 'ngx-mud-ui/stepper';

const PAD = 'padding:24px';

@Component({
  selector: 'mud-stepper-linear-reactive-demo',
  imports: [MudStepper, MudStep, ReactiveFormsModule],
  template: `
    <mud-stepper #stepper [linear]="true">
      <mud-step label="Identity" supportingText="Who you are" errorMessage="Complete your identity" [stepControl]="identity">
        <form [formGroup]="identity" style="display:grid;gap:8px;max-width:320px">
          <label for="pt-name">Full name (required)</label>
          <input id="pt-name" formControlName="name" />
        </form>
      </mud-step>
      <mud-step label="Address" supportingText="Where you live" [stepControl]="address">
        <form [formGroup]="address" style="display:grid;gap:8px;max-width:320px">
          <label for="pt-street">Street (required)</label>
          <input id="pt-street" formControlName="street" />
        </form>
      </mud-step>
      <mud-step label="Review" supportingText="Check and submit">
        <p>All done — review your data.</p>
      </mud-step>
    </mud-stepper>
    <div style="margin-top:16px;display:flex;gap:8px">
      <button type="button" (click)="stepper.previous()">Back</button>
      <button type="button" (click)="stepper.next()">Next</button>
    </div>
  `,
})
class StepperLinearReactiveDemo {
  readonly identity = new FormGroup({ name: new FormControl('', Validators.required) });
  readonly address = new FormGroup({ street: new FormControl('', Validators.required) });
}

@Component({
  selector: 'mud-stepper-linear-signal-forms-demo',
  imports: [MudStepper, MudStep],
  template: `
    <mud-stepper #stepper [linear]="true">
      <mud-step label="Identity" [stepControl]="identity">
        <div style="display:grid;gap:8px;max-width:320px">
          <label for="pt-sf-name">Full name (required)</label>
          <input id="pt-sf-name" [value]="model().name" (input)="setName($event)" />
        </div>
      </mud-step>
      <mud-step label="Review">
        <p>Signal-forms flow complete.</p>
      </mud-step>
    </mud-stepper>
    <div style="margin-top:16px;display:flex;gap:8px">
      <button type="button" (click)="stepper.previous()">Back</button>
      <button type="button" (click)="stepper.next()">Next</button>
    </div>
  `,
})
class StepperLinearSignalFormsDemo {
  readonly model = signal({ name: '' });
  readonly identity = form(this.model, (path) => {
    required(path.name);
  });

  setName(event: Event): void {
    this.model.set({ name: (event.target as HTMLInputElement).value });
  }
}

const meta: Meta<MudStepper> = {
  title: 'Components/Stepper',
  component: MudStepper,
  decorators: [
    moduleMetadata({
      imports: [
        MudStepper,
        MudStep,
        MudStepIndicator,
        MudIndicatorStep,
        StepperLinearReactiveDemo,
        StepperLinearSignalFormsDemo,
      ],
    }),
  ],
  argTypes: {
    linear: { control: 'boolean', description: 'Gate navigation on completing previous steps' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    selectedIndex: { control: { type: 'number', min: 0, max: 3, step: 1 } },
    compact: { control: 'boolean', description: 'Force the number-less dot rail at every width' },
    stepClick: { control: false },
  },
  args: {
    linear: false,
    orientation: 'horizontal',
    selectedIndex: 0,
    compact: false,
  },
};

export default meta;

type Story = StoryObj<MudStepper>;

/**
 * Interactive stepper driven by the controls panel. Non-linear by
 * default, so every step is reachable — click a circle or use
 * Arrow keys + Enter on a focused header to navigate; completed and
 * blocked states derive from each step's control once visited. Toggle
 * `linear` to see unvisited steps become `incomplete` and unreachable.
 */
export const Playground: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <div style="${PAD}">
        <mud-stepper
          [linear]="linear"
          [orientation]="orientation"
          [selectedIndex]="selectedIndex"
          [compact]="compact"
        >
          <mud-step label="Step" supportingText="Supporting Text"><p>One</p></mud-step>
          <mud-step label="Step" supportingText="Supporting Text"><p>Two</p></mud-step>
          <mud-step label="Step"><p>Three</p></mud-step>
          <mud-step label="Step"><p>Four</p></mud-step>
        </mud-stepper>
      </div>
    `,
  }),
};

/** All five visual states, forced via the `state` override input. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD}">
        <mud-stepper selectedIndex="0">
          <mud-step label="Current"><p></p></mud-step>
          <mud-step label="Completed" state="completed"><p></p></mud-step>
          <mud-step label="Available" state="available"><p></p></mud-step>
          <mud-step label="Blocked" state="blocked"><p></p></mud-step>
          <mud-step label="Incomplete" state="incomplete"><p></p></mud-step>
        </mud-stepper>
      </div>
    `,
  }),
};

/** Linear + reactive forms: Next is gated by each step's FormGroup. */
/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const LINEAR_REACTIVE_SOURCE = `
@Component({
  imports: [MudStepper, MudStep, ReactiveFormsModule],
  template: \`
    <mud-stepper #stepper [linear]="true">
      <mud-step
        label="Identity"
        supportingText="Who you are"
        errorMessage="Complete your identity"
        [stepControl]="identity"
      >
        <form [formGroup]="identity">
          <input formControlName="name" />
        </form>
      </mud-step>
      <mud-step label="Address" supportingText="Where you live" [stepControl]="address">
        <form [formGroup]="address">
          <input formControlName="street" />
        </form>
      </mud-step>
      <mud-step label="Review">All done — review your data.</mud-step>
    </mud-stepper>

    <button type="button" (click)="stepper.previous()">Back</button>
    <button type="button" (click)="stepper.next()">Next</button>
  \`,
})
export class ApplicationWizard {
  // \`linear\` blocks moving forward until the current step's control is valid,
  // so it only does anything when steps carry a stepControl.
  readonly identity = new FormGroup({ name: new FormControl('', Validators.required) });
  readonly address = new FormGroup({ street: new FormControl('', Validators.required) });
}
`;

export const LinearReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: LINEAR_REACTIVE_SOURCE, language: 'ts' } },
  },
  render: () => ({
    template: `<div style="${PAD}"><mud-stepper-linear-reactive-demo /></div>`,
  }),
};

/** Linear + signal forms: same gating driven by a signal-forms field. */
/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const LINEAR_SIGNAL_SOURCE = `
@Component({
  imports: [MudStepper, MudStep],
  template: \`
    <mud-stepper #stepper [linear]="true">
      <mud-step label="Identity" [stepControl]="identity">
        <input [value]="model().name" (input)="setName($event)" />
      </mud-step>
      <mud-step label="Review">Signal-forms flow complete.</mud-step>
    </mud-stepper>

    <button type="button" (click)="stepper.previous()">Back</button>
    <button type="button" (click)="stepper.next()">Next</button>
  \`,
})
export class SignalFormsWizard {
  readonly model = signal({ name: '' });
  readonly identity = form(this.model, (path) => {
    required(path.name);
  });

  setName(event: Event): void {
    this.model.set({ name: (event.target as HTMLInputElement).value });
  }
}
`;

export const LinearSignalForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: LINEAR_SIGNAL_SOURCE, language: 'ts' } },
  },
  render: () => ({
    template: `<div style="${PAD}"><mud-stepper-linear-signal-forms-demo /></div>`,
  }),
};

/** Vertical orientation renders each panel inline under its header. */
export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:480px">
        <mud-stepper orientation="vertical">
          <mud-step label="Identity" supportingText="Who you are"><p>Identity form</p></mud-step>
          <mud-step label="Address"><p>Address form</p></mud-step>
          <mud-step label="Review"><p>Review</p></mud-step>
        </mud-stepper>
      </div>
    `,
  }),
};

/**
 * Containers narrower than 600px auto-switch to the compact dot rail
 * (numbers gone, labels visually hidden but still announced) — driven by a
 * ResizeObserver on the container, not a viewport media query, so this
 * 360px-wide container shows it directly.
 */
export const Mobile: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:360px">
        <mud-stepper>
          <mud-step label="One" state="completed"><p></p></mud-step>
          <mud-step label="Two"><p></p></mud-step>
          <mud-step label="Three"><p></p></mud-step>
          <mud-step label="Four"><p></p></mud-step>
        </mud-stepper>
      </div>
    `,
  }),
};

/** Static instructional list — no current step, no interaction. */
export const StepIndicator: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:480px">
        <mud-step-indicator>
          <mud-indicator-step heading="Create account">
            Register using your government ID.
            <button type="button">Start</button>
          </mud-indicator-step>
          <mud-indicator-step heading="Verify identity">
            Upload the requested documents.
          </mud-indicator-step>
          <mud-indicator-step heading="Submit application" />
        </mud-step-indicator>
      </div>
    `,
  }),
};

/**
 * The number-less dot rail. Forced here via `compact`; horizontal steppers
 * also switch to it automatically when their container is narrower than
 * 600px. Labels stay in the DOM for assistive tech.
 */
export const Compact: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="max-width:420px">
        <mud-stepper compact>
          <mud-step label="Identity">Step one content</mud-step>
          <mud-step label="Documents">Step two content</mud-step>
          <mud-step label="Review">Step three content</mud-step>
        </mud-stepper>
      </div>
    `,
  }),
};
