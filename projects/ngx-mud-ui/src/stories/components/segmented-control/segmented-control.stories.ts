import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, pattern } from '@angular/forms/signals';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { bulletList, dotGrid, MudIconComponent, mapPin, provideMudIcons } from 'ngx-mud-ui/icons';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

const PAD = 'padding:24px';
const COL = 'display:flex;flex-direction:column;gap:16px;align-items:flex-start;padding:24px';

const meta: Meta<MudSegmentedControl<string>> = {
  title: 'Components/Segmented Control',
  component: MudSegmentedControl,
  decorators: [
    applicationConfig({ providers: [provideMudIcons([bulletList, dotGrid, mapPin])] }),
    moduleMetadata({ imports: [MudSegmentedControl, MudSegment, MudIconComponent, MudTooltip] }),
  ],
  argTypes: {
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    ariaLabel: { control: 'text', description: 'Accessible name of the radiogroup' },
    value: { control: 'inline-radio', options: ['list', 'grid', 'map'] },
  },
  args: {
    disabled: false,
    fullWidth: false,
    size: 'medium',
    ariaLabel: 'View',
    value: 'list',
  },
};

export default meta;

type Story = StoryObj<MudSegmentedControl<string>>;

/**
 * The surface itself is the click target: 40px-tall segments (16/24 text)
 * on a 6px-padded pill. Arrow keys move focus AND selection (WAI-ARIA
 * radio-group pattern); the two-way `value` model applies immediately.
 */
export const Playground: Story = {
  // `ariaLabel` is aliased (`aria-label`), so pass it under a non-colliding
  // prop name — a raw `ariaLabel` prop crashes the Storybook wrapper.
  render: ({ ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel },
    template: `
      <div style="${PAD}">
        <mud-segmented-control
          [(value)]="value"
          [disabled]="disabled"
          [fullWidth]="fullWidth"
          [size]="size"
          [aria-label]="ariaLabelText"
        >
          <button mud-segment value="list">List</button>
          <button mud-segment value="grid">Grid</button>
          <button mud-segment value="map">Map</button>
        </mud-segmented-control>
        <p style="color:var(--color-text-base-secondary)">Selected: {{ value }}</p>
      </div>
    `,
  }),
};

/**
 * Segments are always equal-width (the widest label sizes every column).
 * Keep it to 5 segments at most — more causes cognitive overload.
 */
/** The small rung: 32px segments with 12px inline padding (labels stay 14/20). */
export const Small: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { view: 'list' },
    template: `
      <mud-segmented-control size="small" [(value)]="view" aria-label="View">
        <button mud-segment value="list">List</button>
        <button mud-segment value="grid">Grid</button>
        <button mud-segment value="map">Map</button>
      </mud-segmented-control>
    `,
  }),
};

export const SegmentCounts: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { counts: [2, 3, 4, 5] },
    template: `
      @for (count of counts; track count) {
        <div style="${PAD};padding-bottom:0">
          <mud-segmented-control value="1" aria-label="{{ count }} segments">
            @for (i of [1, 2, 3, 4, 5].slice(0, count); track i) {
              <button mud-segment [value]="'' + i">Label</button>
            }
          </mud-segmented-control>
        </div>
      }
    `,
  }),
};

/**
 * Icons are projected before the label and inherit the text color
 * (including the inverted selected state). Pass `scale="24"` so the icon
 * geometry matches the 24px line-height.
 */
export const LeadingIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { value: 'list' },
    template: `
      <div style="${PAD}">
        <mud-segmented-control [(value)]="value" aria-label="View">
          <button mud-segment value="list"><mud-icon name="bullet-list" [scale]="24" /> List</button>
          <button mud-segment value="grid"><mud-icon name="dot-grid" [scale]="24" /> Grid</button>
          <button mud-segment value="map"><mud-icon name="map-pin" [scale]="24" /> Map</button>
        </mud-segmented-control>
      </div>
    `,
  }),
};

/** The whole group can be disabled, or single segments individually. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};display:flex;flex-direction:column;gap:16px;align-items:flex-start">
        <mud-segmented-control value="a" disabled aria-label="Disabled group">
          <button mud-segment value="a">Label</button>
          <button mud-segment value="b">Label</button>
          <button mud-segment value="c">Label</button>
        </mud-segmented-control>
        <mud-segmented-control value="a" aria-label="Disabled segment">
          <button mud-segment value="a">Available</button>
          <button mud-segment value="b" disabled>Sold out</button>
          <button mud-segment value="c">Available</button>
        </mud-segmented-control>
      </div>
    `,
  }),
};

/**
 * Prefer short labels. An unavoidable long label truncates on ONE line with
 * an ellipsis — a segmented control never wraps to two lines.
 */
export const LongLabels: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:480px">
        <mud-segmented-control value="1" fullWidth aria-label="Long labels">
          <button mud-segment value="1">This is a very long label that truncates</button>
          <button mud-segment value="2">Short</button>
          <button mud-segment value="3">Medium label</button>
        </mud-segmented-control>
      </div>
    `,
  }),
};

/**
 * The library deliberately does NOT auto-add tooltips to truncated labels:
 * truncation is visual-only (screen readers get the full text), and
 * detecting it would couple this entry point to the CDK overlay. When a
 * long label is unavoidable, compose `mudTooltip` from
 * `ngx-mud-ui/tooltip` on the same button — the segment IS the button, so
 * directives stack directly. Apply it unconditionally or gate it on your
 * own truncation check.
 */
export const TruncatedWithTooltip: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${PAD};max-width:480px">
        <mud-segmented-control value="1" fullWidth aria-label="Report period">
          <button mud-segment value="1" mudTooltip="Quarterly financial reports">
            Quarterly financial reports
          </button>
          <button mud-segment value="2">Annual</button>
          <button mud-segment value="3">Custom range</button>
        </mud-segmented-control>
      </div>
    `,
  }),
};

/**
 * Desktop: the control hugs its content. Mobile: set `fullWidth` so the
 * pill spans the screen and every segment shares the width equally.
 */
export const DesktopAndMobile: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { desktop: 'week', mobile: 'week' },
    template: `
      <div style="${PAD}">
        <p style="color:var(--color-text-base-secondary)">Desktop — inline, content-sized</p>
        <mud-segmented-control [(value)]="desktop" aria-label="Period (desktop)">
          <button mud-segment value="day">Day</button>
          <button mud-segment value="week">Week</button>
          <button mud-segment value="month">Month</button>
        </mud-segmented-control>

        <p style="color:var(--color-text-base-secondary);margin-top:32px">Mobile (360px) — fullWidth</p>
        <div style="width:360px;border:1px dashed var(--color-border-base-secondary);border-radius:12px;padding:16px">
          <mud-segmented-control [(value)]="mobile" fullWidth aria-label="Period (mobile)">
            <button mud-segment value="day">Day</button>
            <button mud-segment value="week">Week</button>
            <button mud-segment value="month">Month</button>
          </mud-segmented-control>
        </div>
      </div>
    `,
  }),
};

@Component({
  selector: 'mud-segmented-reactive-demo',
  imports: [MudSegmentedControl, MudSegment, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-segmented-control [formControl]="view" aria-label="Vizualizare">
        <button mud-segment value="list">Listă</button>
        <button mud-segment value="grid">Grilă</button>
        <button mud-segment value="map">Hartă</button>
      </mud-segmented-control>

      <code>value: {{ view.value }} | touched: {{ view.touched }} | dirty: {{ view.dirty }}</code>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" (click)="view.setValue('map')">setValue('map')</button>
        <button type="button" (click)="view.disabled ? view.enable() : view.disable()">
          toggle disabled
        </button>
        <button type="button" (click)="view.reset('list')">reset</button>
      </div>
    </div>
  `,
})
class SegmentedReactiveDemo {
  readonly view = new FormControl<string>('list', { nonNullable: true });
}

const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudSegmentedControl, MudSegment, ReactiveFormsModule],
  template: \`
    <mud-segmented-control [formControl]="view" aria-label="Vizualizare">
      <button mud-segment value="list">Listă</button>
      <button mud-segment value="grid">Grilă</button>
      <button mud-segment value="map">Hartă</button>
    </mud-segmented-control>
  \`,
})
export class ViewSwitcher {
  // ControlValueAccessor is implemented, so formControl / formControlName /
  // ngModel, disable() and reset() all behave like a native control.
  readonly view = new FormControl<string>('list', { nonNullable: true });
}
`;

/**
 * The control implements `ControlValueAccessor`, so `formControl`,
 * `formControlName` and `ngModel` all work — including `disable()` and
 * `reset()`. Focus leaving the group marks it touched; moving between
 * segments does not.
 */
export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SegmentedReactiveDemo] })],
  render: () => ({ template: `<mud-segmented-reactive-demo />` }),
};

@Component({
  selector: 'mud-segmented-signal-demo',
  imports: [MudSegmentedControl, MudSegment, MudInlineMessage, FormField],
  template: `
    <div style="${COL}">
      <mud-segmented-control [formField]="form.view" aria-label="Vizualizare">
        <button mud-segment value="list">Listă</button>
        <button mud-segment value="grid">Grilă</button>
        <button mud-segment value="map">Hartă</button>
      </mud-segmented-control>

      @if (form.view().errors().length > 0) {
        <mud-inline-message variant="error" size="small">
          {{ form.view().errors()[0].message }}
        </mud-inline-message>
      }

      <code>model: {{ model().view }} | valid: {{ form.view().valid() }}</code>
    </div>
  `,
})
class SegmentedSignalDemo {
  readonly model = signal({ view: 'list' });

  // A segmented control always holds one of its segment values, so validate a
  // real selection rather than an empty one.
  readonly form = form(this.model, (path) => {
    pattern(path.view, /^(list|grid)$/, {
      message: 'Harta nu este disponibilă pentru acest serviciu.',
    });
  });
}

const SIGNAL_FORMS_SOURCE = `
@Component({
  imports: [MudSegmentedControl, MudSegment, MudInlineMessage, FormField],
  template: \`
    <mud-segmented-control [formField]="form.view" aria-label="Vizualizare">
      <button mud-segment value="list">Listă</button>
      <button mud-segment value="grid">Grilă</button>
      <button mud-segment value="map">Hartă</button>
    </mud-segmented-control>

    <!-- The control has no error region of its own, so render the message beside it. -->
    @if (form.view().errors().length > 0) {
      <mud-inline-message variant="error" size="small">
        {{ form.view().errors()[0].message }}
      </mud-inline-message>
    }
  \`,
})
export class ViewSwitcher {
  readonly model = signal({ view: 'list' });

  // [formField] binds value, disabled and errors through FormValueControl.
  // A segmented control always holds one of its segment values — it self-heals
  // away from a value no segment carries — so validate a real selection rather
  // than an empty one; \`required\` would never fail here.
  readonly form = form(this.model, (path) => {
    pattern(path.view, /^(list|grid)$/, {
      message: 'Harta nu este disponibilă pentru acest serviciu.',
    });
  });
}
`;

/**
 * `MudSegmentedControl` implements the signal-forms `FormValueControl` contract,
 * so `[formField]` binds the value, the disabled state and the validation
 * errors. It has no error region of its own — a segmented control is a view
 * switcher, not a field — so the message is rendered beside it.
 *
 * Pick **Hartă** to see the validator fail.
 */
export const SignalForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SIGNAL_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SegmentedSignalDemo] })],
  render: () => ({ template: `<mud-segmented-signal-demo />` }),
};
