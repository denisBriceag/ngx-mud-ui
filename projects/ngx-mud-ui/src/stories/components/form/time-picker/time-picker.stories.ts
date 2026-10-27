import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudTimeInput, MudTimePicker } from 'ngx-mud-ui/time-picker';
import type { MudTimeFilter } from 'ngx-mud-ui/time-picker';
import { provideMudLabels } from 'ngx-mud-ui/i18n';
import type { MudLabelsPartial } from 'ngx-mud-ui/i18n';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudButton } from 'ngx-mud-ui/button';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:360px;padding:24px';

// `ariaDescribedby` is aliased to `aria-describedby` on the component, so the
// Storybook arg key IS that string (banner story, same trap). `aria-label` is
// not an arg at all: the template always projects a <mud-label>, so the input
// would be inert (2026-09-11 ruling: drop it, never fake it).
// A function has no Storybook control, so the Playground offers named presets
// that `mapping` resolves to the real `timeFilter` predicate.
const TIME_FILTERS: Record<string, MudTimeFilter | undefined> = {
  none: undefined,
  workingHours: (time) => time >= '09:00' && time <= '17:30',
  noLunchBreak: (time) => !time.startsWith('12'),
  halfHoursOnly: (time) => time.endsWith(':00') || time.endsWith(':30'),
};

type TimeArgs = Omit<MudTimeInput, 'timeFilter'> & {
  'aria-describedby'?: string;
  'aria-label'?: string;
  timeFilter?: keyof typeof TIME_FILTERS;
};

const meta: Meta<TimeArgs> = {
  title: 'Components/Form/Time picker',
  component: MudTimeInput,
  decorators: [
    moduleMetadata({ imports: [MudTimeInput, MudTimePicker, MudLabel, MudInlineMessage] }),
  ],
  argTypes: {
    'aria-label': { control: false, table: { disable: true } },
    minuteStep: { control: 'inline-radio', options: [1, 5, 10, 15, 30] },
    timeFilter: {
      control: 'select',
      options: Object.keys(TIME_FILTERS),
      mapping: TIME_FILTERS,
      description: [
        'Return `true` for a SELECTABLE time. Runs after `min`/`max` and `minuteStep`. The presets:',
        '```ts',
        "workingHours:  (time) => time >= '09:00' && time <= '17:30'",
        "noLunchBreak:  (time) => !time.startsWith('12')",
        "halfHoursOnly: (time) => time.endsWith(':00') || time.endsWith(':30')",
        '```',
      ].join('\n'),
    },
  },
  args: {
    value: null,
    open: false,
    size: 'medium',
    variant: 'default',
    clearable: true,
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    name: '',
    placeholder: undefined,
    min: undefined,
    max: undefined,
    minuteStep: 1,
    timeFilter: 'none',
    'aria-describedby': undefined,
  },
};

export default meta;

type Story = StoryObj<TimeArgs>;

/** The 90% case: one tag, a label, and a picker the user can also type into. */
export const Playground: Story = {
  render: ({ 'aria-describedby': ariaDescribedby, ...args }) => ({
    props: { ...args, ariaDescribedbyText: ariaDescribedby },
    template: `
      <div style="${COL}">
        <mud-time-input
          [value]="value"
          [open]="open"
          [size]="size"
          [variant]="variant"
          [clearable]="clearable"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [name]="name"
          [placeholder]="placeholder"
          [min]="min"
          [max]="max"
          [minuteStep]="minuteStep"
          [timeFilter]="timeFilter"
          [aria-describedby]="ariaDescribedbyText"
        >
          <mud-label>Ora programării</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Alegeți o oră validă.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Tastați ora sau alegeți-o din selector.</mud-inline-message>
          }
        </mud-time-input>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-time-input size="medium" value="09:30">
          <mud-label>Medium (40px)</mud-label>
        </mud-time-input>
        <mud-time-input size="large" value="09:30">
          <mud-label>Large (48px)</mud-label>
        </mud-time-input>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-time-input variant="default" value="09:30"><mud-label>Default</mud-label></mud-time-input>
        <mud-time-input variant="warning" value="09:30"><mud-label>Warning</mud-label></mud-time-input>
        <mud-time-input variant="destructive" value="09:30"><mud-label>Destructive</mud-label></mud-time-input>
        <mud-time-input variant="success" value="09:30"><mud-label>Success</mud-label></mud-time-input>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-time-input required><mud-label>Required</mud-label></mud-time-input>
        <mud-time-input readonly value="09:30"><mud-label>Read-only</mud-label></mud-time-input>
        <mud-time-input disabled value="09:30"><mud-label>Disabled</mud-label></mud-time-input>
        <mud-time-input invalid value="09:30">
          <mud-label>Invalid</mud-label>
          <mud-inline-message variant="error">Ora este în afara programului.</mud-inline-message>
        </mud-time-input>
      </div>
    `,
  }),
};

/** `min`/`max` bound both the typed entry and the picker: out-of-range options are disabled. */
export const MinMax: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-time-input min="09:00" max="17:30" clearable>
          <mud-label>Program (09:00 – 17:30)</mud-label>
          <mud-inline-message hideIcon>O oră din afara intervalului nu este acceptată.</mud-inline-message>
        </mud-time-input>
      </div>
    `,
  }),
};

/** Working hours with a lunch break, on a 15-minute grid: the same rule bounds the picker and the typed entry. */
export const WorkingHours: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      workingHours: (time: string) => time >= '09:00' && time <= '17:30' && !time.startsWith('12'),
    },
    template: `
      <div style="${COL}">
        <mud-time-input [timeFilter]="workingHours" minuteStep="15" clearable>
          <mud-label>Ora programării</mud-label>
          <mud-inline-message hideIcon>09:00 – 17:30, fără pauza de prânz, din 15 în 15 minute.</mud-inline-message>
        </mud-time-input>
      </div>
    `,
  }),
};

@Component({
  selector: 'mud-time-signal-forms-demo',
  imports: [MudTimeInput, MudLabel, MudInlineMessage, MudButton, FormField, JsonPipe],
  template: `
    <form style="${COL}" (submit)="$event.preventDefault()">
      <mud-time-input [formField]="form.start" clearable>
        <mud-label>Ora de început</mud-label>
        @if (form.start().touched() && form.start().invalid()) {
          <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
        }
      </mud-time-input>
      <button mudButton type="submit" [disabled]="form().invalid()">Trimite</button>
      <pre>{{ model() | json }}</pre>
    </form>
  `,
})
class TimeSignalFormsDemo {
  readonly model = signal<{ start: string | null }>({ start: null });

  readonly form = form(this.model, (path) => {
    required(path.start, { message: 'Alegeți o oră.' });
  });
}

export const SignalForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<mud-time-input [formField]="form.start" clearable>…</mud-time-input>' } },
  },
  decorators: [moduleMetadata({ imports: [TimeSignalFormsDemo] })],
  render: () => ({ template: `<mud-time-signal-forms-demo />` }),
};

@Component({
  selector: 'mud-time-reactive-forms-demo',
  imports: [MudTimeInput, MudLabel, MudInlineMessage, ReactiveFormsModule, JsonPipe],
  template: `
    <div style="${COL}">
      <mud-time-input [formControl]="control" clearable>
        <mud-label>Ora de început</mud-label>
        @if (control.touched && control.invalid) {
          <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
        }
      </mud-time-input>
      <pre>{{ { value: control.value, valid: control.valid } | json }}</pre>
    </div>
  `,
})
class TimeReactiveFormsDemo {
  readonly control = new FormControl<string | null>(null, Validators.required);
}

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<mud-time-input [formControl]="control" clearable>…</mud-time-input>' } },
  },
  decorators: [moduleMetadata({ imports: [TimeReactiveFormsDemo] })],
  render: () => ({ template: `<mud-time-reactive-forms-demo />` }),
};

const RO_TIME_LABELS: MudLabelsPartial = {
  timePicker: {
    picker: 'Selectează ora',
    openPicker: 'Deschide selectorul de oră',
    hours: 'Ore',
    minutes: 'Minute',
    clear: 'Șterge',
    formatHint: (pattern) => `Format oră: ${pattern}`,
  },
};

// Module-level so the provider (applicationConfig) and the demo's button read
// the same signal: flipping it re-renders every open picker's strings live.
const TIME_LANG = signal<'en' | 'ro'>('ro');

/** Every string comes from the `timePicker` labels; a signal keeps a language switch live. */
@Component({
  selector: 'mud-time-labels-demo',
  imports: [MudTimeInput, MudLabel, MudButton],
  template: `
    <div style="${COL}">
      <button mudButton="outlined" color="secondary" type="button" (click)="toggle()">
        Limba: {{ lang() === 'ro' ? 'Română' : 'English' }}
      </button>
      <mud-time-input clearable value="09:30">
        <mud-label>{{ lang() === 'ro' ? 'Ora' : 'Time' }}</mud-label>
      </mud-time-input>
    </div>
  `,
})
class TimeLabelsDemo {
  readonly lang = TIME_LANG;

  toggle(): void {
    this.lang.update((lang) => (lang === 'ro' ? 'en' : 'ro'));
  }
}

export const Labels: Story = {
  name: 'Localized labels',
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: 'provideMudLabels(computed(() => (lang() === "ro" ? RO_TIME_LABELS : {})))',
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [provideMudLabels(computed(() => (TIME_LANG() === 'ro' ? RO_TIME_LABELS : {})))],
    }),
    moduleMetadata({ imports: [TimeLabelsDemo] }),
  ],
  render: () => ({ template: `<mud-time-labels-demo />` }),
};

/** The panel on its own, for a page that shows a picker rather than a field. */
export const StandalonePicker: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { value: signal<string | null>('09:30') },
    template: `
      <div style="${COL}">
        <mud-time-picker [(value)]="value" min="08:00" max="18:00" />
        <p>Selected: {{ value() ?? '—' }}</p>
      </div>
    `,
  }),
};
