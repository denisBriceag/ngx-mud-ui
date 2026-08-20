import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { EgovIndicatorStep, EgovProgressTracker, EgovStep, EgovStepIndicator } from '../../../progress-tracker/src/public-api';

const PAD = 'padding:24px';

@Component({
  selector: 'egov-progress-tracker-linear-reactive-demo',
  imports: [EgovProgressTracker, EgovStep, ReactiveFormsModule],
  template: `
    <egov-progress-tracker #tracker [linear]="true">
      <egov-step label="Identity" supportingText="Who you are" errorMessage="Complete your identity" [stepControl]="identity">
        <form [formGroup]="identity" style="display:grid;gap:8px;max-width:320px">
          <label for="pt-name">Full name (required)</label>
          <input id="pt-name" formControlName="name" />
        </form>
      </egov-step>
      <egov-step label="Address" supportingText="Where you live" [stepControl]="address">
        <form [formGroup]="address" style="display:grid;gap:8px;max-width:320px">
          <label for="pt-street">Street (required)</label>
          <input id="pt-street" formControlName="street" />
        </form>
      </egov-step>
      <egov-step label="Review" supportingText="Check and submit">
        <p>All done — review your data.</p>
      </egov-step>
    </egov-progress-tracker>
    <div style="margin-top:16px;display:flex;gap:8px">
      <button type="button" (click)="tracker.previous()">Back</button>
      <button type="button" (click)="tracker.next()">Next</button>
    </div>
  `,
})
class ProgressTrackerLinearReactiveDemo {
  readonly identity = new FormGroup({ name: new FormControl('', Validators.required) });
  readonly address = new FormGroup({ street: new FormControl('', Validators.required) });
}

@Component({
  selector: 'egov-progress-tracker-linear-signal-forms-demo',
  imports: [EgovProgressTracker, EgovStep],
  template: `
    <egov-progress-tracker #tracker [linear]="true">
      <egov-step label="Identity" [stepControl]="identity">
        <div style="display:grid;gap:8px;max-width:320px">
          <label for="pt-sf-name">Full name (required)</label>
          <input id="pt-sf-name" [value]="model().name" (input)="setName($event)" />
        </div>
      </egov-step>
      <egov-step label="Review">
        <p>Signal-forms flow complete.</p>
      </egov-step>
    </egov-progress-tracker>
    <div style="margin-top:16px;display:flex;gap:8px">
      <button type="button" (click)="tracker.previous()">Back</button>
      <button type="button" (click)="tracker.next()">Next</button>
    </div>
  `,
})
class ProgressTrackerLinearSignalFormsDemo {
  readonly model = signal({ name: '' });
  readonly identity = form(this.model, (path) => {
    required(path.name);
  });

  setName(event: Event): void {
    this.model.set({ name: (event.target as HTMLInputElement).value });
  }
}

const meta: Meta<EgovProgressTracker> = {
  title: 'Components/Progress Tracker',
  component: EgovProgressTracker,
  decorators: [
    moduleMetadata({
      imports: [
        EgovProgressTracker,
        EgovStep,
        EgovStepIndicator,
        EgovIndicatorStep,
        ProgressTrackerLinearReactiveDemo,
        ProgressTrackerLinearSignalFormsDemo,
      ],
    }),
  ],
  argTypes: {
    linear: { control: 'boolean', description: 'Gate navigation on completing previous steps' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    selectedIndex: { control: { type: 'number', min: 0, max: 3, step: 1 } },
  },
  args: {
    linear: false,
    orientation: 'horizontal',
    selectedIndex: 0,
  },
};

export default meta;

type Story = StoryObj<EgovProgressTracker>;

/**
 * Interactive tracker driven by the controls panel. Non-linear by
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
        <egov-progress-tracker
          [linear]="linear"
          [orientation]="orientation"
          [selectedIndex]="selectedIndex"
        >
          <egov-step label="Step" supportingText="Supporting Text"><p>One</p></egov-step>
          <egov-step label="Step" supportingText="Supporting Text"><p>Two</p></egov-step>
          <egov-step label="Step"><p>Three</p></egov-step>
          <egov-step label="Step"><p>Four</p></egov-step>
        </egov-progress-tracker>
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
        <egov-progress-tracker selectedIndex="0">
          <egov-step label="Current"><p></p></egov-step>
          <egov-step label="Completed" state="completed"><p></p></egov-step>
          <egov-step label="Available" state="available"><p></p></egov-step>
          <egov-step label="Blocked" state="blocked"><p></p></egov-step>
          <egov-step label="Incomplete" state="incomplete"><p></p></egov-step>
        </egov-progress-tracker>
      </div>
    `,
  }),
};

/** Linear + reactive forms: Next is gated by each step's FormGroup. */
export const LinearReactiveForms: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<div style="${PAD}"><egov-progress-tracker-linear-reactive-demo /></div>`,
  }),
};

/** Linear + signal forms: same gating driven by a signal-forms field. */
export const LinearSignalForms: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<div style="${PAD}"><egov-progress-tracker-linear-signal-forms-demo /></div>`,
  }),
};

/** Vertical orientation renders each panel inline under its header. */
export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:480px">
        <egov-progress-tracker orientation="vertical">
          <egov-step label="Identity" supportingText="Who you are"><p>Identity form</p></egov-step>
          <egov-step label="Address"><p>Address form</p></egov-step>
          <egov-step label="Review"><p>Review</p></egov-step>
        </egov-progress-tracker>
      </div>
    `,
  }),
};

/**
 * ≤991px: 20px empty circles, labels visually hidden (still announced).
 * The container below is narrow for layout purposes only — the compact
 * look is actually driven by a viewport media query, so to see it for
 * real, resize the Storybook preview (or the browser) to ≤991px wide.
 */
export const Mobile: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:360px">
        <egov-progress-tracker>
          <egov-step label="One" state="completed"><p></p></egov-step>
          <egov-step label="Two"><p></p></egov-step>
          <egov-step label="Three"><p></p></egov-step>
          <egov-step label="Four"><p></p></egov-step>
        </egov-progress-tracker>
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
        <egov-step-indicator>
          <egov-indicator-step heading="Create account">
            Register using your government ID.
            <button type="button">Start</button>
          </egov-indicator-step>
          <egov-indicator-step heading="Verify identity">
            Upload the requested documents.
          </egov-indicator-step>
          <egov-indicator-step heading="Submit application" />
        </egov-step-indicator>
      </div>
    `,
  }),
};
