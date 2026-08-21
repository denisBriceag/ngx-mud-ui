import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudIndicatorStep, MudProgressTracker, MudStep, MudStepIndicator } from '../../../progress-tracker/src/public-api';

const PAD = 'padding:24px';

@Component({
  selector: 'mud-progress-tracker-linear-reactive-demo',
  imports: [MudProgressTracker, MudStep, ReactiveFormsModule],
  template: `
    <mud-progress-tracker #tracker [linear]="true">
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
    </mud-progress-tracker>
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
  selector: 'mud-progress-tracker-linear-signal-forms-demo',
  imports: [MudProgressTracker, MudStep],
  template: `
    <mud-progress-tracker #tracker [linear]="true">
      <mud-step label="Identity" [stepControl]="identity">
        <div style="display:grid;gap:8px;max-width:320px">
          <label for="pt-sf-name">Full name (required)</label>
          <input id="pt-sf-name" [value]="model().name" (input)="setName($event)" />
        </div>
      </mud-step>
      <mud-step label="Review">
        <p>Signal-forms flow complete.</p>
      </mud-step>
    </mud-progress-tracker>
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

const meta: Meta<MudProgressTracker> = {
  title: 'Components/Progress Tracker',
  component: MudProgressTracker,
  decorators: [
    moduleMetadata({
      imports: [
        MudProgressTracker,
        MudStep,
        MudStepIndicator,
        MudIndicatorStep,
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

type Story = StoryObj<MudProgressTracker>;

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
        <mud-progress-tracker
          [linear]="linear"
          [orientation]="orientation"
          [selectedIndex]="selectedIndex"
        >
          <mud-step label="Step" supportingText="Supporting Text"><p>One</p></mud-step>
          <mud-step label="Step" supportingText="Supporting Text"><p>Two</p></mud-step>
          <mud-step label="Step"><p>Three</p></mud-step>
          <mud-step label="Step"><p>Four</p></mud-step>
        </mud-progress-tracker>
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
        <mud-progress-tracker selectedIndex="0">
          <mud-step label="Current"><p></p></mud-step>
          <mud-step label="Completed" state="completed"><p></p></mud-step>
          <mud-step label="Available" state="available"><p></p></mud-step>
          <mud-step label="Blocked" state="blocked"><p></p></mud-step>
          <mud-step label="Incomplete" state="incomplete"><p></p></mud-step>
        </mud-progress-tracker>
      </div>
    `,
  }),
};

/** Linear + reactive forms: Next is gated by each step's FormGroup. */
export const LinearReactiveForms: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<div style="${PAD}"><mud-progress-tracker-linear-reactive-demo /></div>`,
  }),
};

/** Linear + signal forms: same gating driven by a signal-forms field. */
export const LinearSignalForms: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<div style="${PAD}"><mud-progress-tracker-linear-signal-forms-demo /></div>`,
  }),
};

/** Vertical orientation renders each panel inline under its header. */
export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:480px">
        <mud-progress-tracker orientation="vertical">
          <mud-step label="Identity" supportingText="Who you are"><p>Identity form</p></mud-step>
          <mud-step label="Address"><p>Address form</p></mud-step>
          <mud-step label="Review"><p>Review</p></mud-step>
        </mud-progress-tracker>
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
        <mud-progress-tracker>
          <mud-step label="One" state="completed"><p></p></mud-step>
          <mud-step label="Two"><p></p></mud-step>
          <mud-step label="Three"><p></p></mud-step>
          <mud-step label="Four"><p></p></mud-step>
        </mud-progress-tracker>
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
 * The number-less dot rail. Forced here via `compact`; horizontal trackers
 * also switch to it automatically when their container is narrower than
 * 600px. Labels stay in the DOM for assistive tech.
 */
export const Compact: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="max-width:420px">
        <mud-progress-tracker compact>
          <mud-step label="Identity">Step one content</mud-step>
          <mud-step label="Documents">Step two content</mud-step>
          <mud-step label="Review">Step three content</mud-step>
        </mud-progress-tracker>
      </div>
    `,
  }),
};
