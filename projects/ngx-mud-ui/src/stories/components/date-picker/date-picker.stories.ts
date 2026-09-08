import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { expect, userEvent, within } from 'storybook/test';
import { MudDateInput, MudDatePicker, mudToday, provideMudDateLabels } from 'ngx-mud-ui/date-picker';
import type { MudDateRange } from 'ngx-mud-ui/date-picker';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:560px;padding:24px';

type DateInputArgs = MudDateInput & { 'aria-label'?: string };

const meta: Meta<DateInputArgs> = {
  title: 'Components/Date picker',
  component: MudDateInput,
  decorators: [moduleMetadata({ imports: [MudDateInput, MudDatePicker] })],
  args: {
    label: 'Data nașterii',
    format: 'DD/MM/YYYY',
    size: 'medium',
    variant: 'default',
    clearable: true,
    disabled: false,
    required: false,
    invalid: false,
    helperText: 'Alegeți o dată din calendar sau tastați-o direct.',
  },
};

export default meta;

type Story = StoryObj<DateInputArgs>;

/** The 90% case: one tag, a label, and a calendar the user can also type into. */
export const Playground: Story = {
  render: ({ 'aria-label': ariaLabel, ...args }) => ({
    props: { ...args, ariaLabelText: ariaLabel },
    template: `
      <div style="${COL}">
        <mud-date-input
          [label]="label"
          [format]="format"
          [size]="size"
          [variant]="variant"
          [clearable]="clearable"
          [disabled]="disabled"
          [required]="required"
          [invalid]="invalid"
          [helperText]="helperText"
          [aria-label]="ariaLabelText"
        />
      </div>
    `,
  }),
};

export const Formats: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-date-input label="DD/MM/YYYY" format="DD/MM/YYYY" />
        <mud-date-input label="MM/DD/YYYY" format="MM/DD/YYYY" />
        <mud-date-input label="YYYY-MM-DD" format="YYYY-MM-DD" />
      </div>
    `,
  }),
};

export const Range: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-date-input mode="range" label="Perioada" clearable
          helperText="Completați data de început; focusul trece automat la data de sfârșit." />
      </div>
    `,
  }),
  // Layout regression pin (browser only — jsdom has no layout): the two
  // entries hug their pattern text and pack at the field's START. With growing
  // entries each grabbed half the control, stranding the separator mid-field.
  play: async ({ canvasElement }) => {
    const control = canvasElement.querySelector<HTMLElement>('.date-field__control')!;
    const entries = Array.from(canvasElement.querySelectorAll<HTMLElement>('.date-field__entry'));

    await expect(entries).toHaveLength(2);

    for (const entry of entries) {
      // Half the control would be ~46% of its width; a packed DD/MM/YYYY at
      // 14px is nowhere near it.
      await expect(entry.offsetWidth).toBeLessThan(control.offsetWidth * 0.35);
    }
  },
};

/**
 * Month/weekday names come from `Intl` via `locale`; every UI string — and,
 * when Intl's month forms don't match the design ("ian." vs "Ian"), the month
 * names themselves — comes from the `MUD_DATE_LABELS` token, overridden
 * app-wide with one `provideMudDateLabels` call.
 */
export const LocalizedRomanian: Story = {
  name: 'Localized (Romanian)',
  parameters: { controls: { disable: true } },
  decorators: [
    applicationConfig({
      providers: [
        provideMudDateLabels({
          calendar: 'Calendar',
          previousMonth: 'Luna precedentă',
          nextMonth: 'Luna următoare',
          previousYear: 'Anul precedent',
          nextYear: 'Anul următor',
          chooseMonth: 'Alegeți luna',
          chooseYear: 'Alegeți anul',
          today: 'Astăzi',
          clear: 'Șterge',
          rangeStart: 'Data de început',
          rangeEnd: 'Data de sfârșit',
          monthNamesShort: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'],
          monthNamesLong: [
            'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
            'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
          ],
          formatHint: (pattern) => `Format: ${pattern}`,
          rangeStartSelected: (start) => `${start} selectat, alegeți data de sfârșit`,
          rangeSelected: (start, end) => `${start} – ${end} selectate`,
        }),
      ],
    }),
  ],
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-date-input label="Data nașterii" locale="ro" clearable />
        <mud-date-picker locale="ro" startAt="2026-08-15" headerStyle="dropdown" />
      </div>
    `,
  }),
};

export const Bounded: Story = {
  name: 'Min, max and disabled dates',
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { today: mudToday(), holidays: ['2026-08-27', '2026-08-31'] },
    template: `
      <div style="${COL}">
        <mud-date-input label="Nu în viitor" [max]="today"
          helperText="Zilele de după azi sunt dezactivate." />
        <mud-date-input label="Fără sărbători" [disabledDates]="holidays"
          helperText="27 și 31 august sunt dezactivate." />
      </div>
    `,
  }),
};

/** The calendar on its own, for pages that show it inline instead of in a popover. */
export const InlineCalendar: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-date-picker appearance="flat" />
      </div>
    `,
  }),
};

export const CalendarModes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;flex-wrap:wrap;padding:24px">
        <mud-date-picker mode="single" />
        <mud-date-picker mode="range" />
        <mud-date-picker mode="multi" />
      </div>
    `,
  }),
};

export const DropdownHeader: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${COL}">
        <mud-date-picker headerStyle="dropdown" />
      </div>
    `,
  }),
};

/**
 * Standalone via `[(value)]`, reactive forms via `[formControl]` — both are
 * `ControlValueAccessor` under the hood.
 */
@Component({
  selector: 'mud-date-forms-demo',
  imports: [MudDateInput, ReactiveFormsModule, JsonPipe],
  template: `
    <div style="${COL}">
      <mud-date-input label="Reactive forms" [formControl]="dob" clearable />
      <p>value: {{ dob.value ?? 'null' }}</p>

      <mud-date-input mode="range" label="Two-way binding" [(value)]="period" />
      <p>value: {{ period() | json }}</p>
    </div>
  `,
})
class FormsDemo {
  readonly dob = new FormControl<string | null>('1990-05-15');
  readonly period = signal<MudDateRange | null>({ start: '2026-08-01', end: '2026-08-31' });
}

export const WithForms: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [FormsDemo] })],
  render: () => ({ template: `<mud-date-forms-demo />` }),
};

/**
 * Signal forms via the FormValueControl contract: `[formField]` binds the
 * value, the required marker and the validation errors — the message below
 * comes from the field's validator, not from an `errorText` input.
 * Note: this reflects signal forms' RAW invalid state (errors show
 * immediately). For custom display timing, skip `[formField]` and bind
 * manually: `[(value)]` + `[invalid]="form.x().invalid() && form.x().touched()"`.
 */
@Component({
  selector: 'mud-date-input-signal-demo',
  imports: [MudDateInput, FormField],
  template: `
    <div style="${COL}">
      <mud-date-input label="Data nașterii" [formField]="form.dob" clearable locale="en-GB" />
      <code>
        value: {{ model().dob ?? '—' }} | touched: {{ form.dob().touched() }} | valid:
        {{ form.dob().valid() }}
      </code>
    </div>
  `,
})
class DateInputSignalDemo {
  readonly model = signal<{ dob: string | null }>({ dob: null });

  readonly form = form(this.model, (path) => {
    required(path.dob, { message: 'Alegeți data nașterii.' });
  });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const SIGNAL_FORMS_SOURCE = `
@Component({
  imports: [MudDateInput, FormField],
  template: \`
    <mud-date-input label="Data nașterii" [formField]="form.dob" clearable />
  \`,
})
export class DobField {
  readonly model = signal<{ dob: string | null }>({ dob: null });

  // Signal forms bind \`required\`, \`invalid\` and \`errors\` on the control for
  // you — no errorText input needed.
  readonly form = form(this.model, (path) => {
    required(path.dob, { message: 'Alegeți data nașterii.' });
  });
}
`;

export const SignalForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SIGNAL_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [DateInputSignalDemo] })],
  render: () => ({ template: `<mud-date-input-signal-demo />` }),
};

/** jsdom reports no selection at all, so caret behaviour is only provable here. */
export const CaretBehaviour: Story = {
  name: 'Caret stays put while typing (browser)',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
  render: () => ({ template: `<div style="${COL}"><mud-date-input label="Date" /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Date') as HTMLInputElement;

    // The input must be the TOP layer, the ghost row underneath: axe's
    // color-contrast check reports "background could not be determined" for
    // any element overlapped from above.
    const rect = input.getBoundingClientRect();
    const top = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)[0];

    await expect(top).toBe(input);

    await userEvent.type(input, '1504');
    // No trailing separator: the mask holds it back until a digit follows it,
    // which is what keeps Backspace able to delete (see the story below).
    await expect(input.value).toBe('15/04');
    await expect(input.selectionStart).toBe(5);

    // Editing mid-value must not fling the caret to the end. `userEvent.type`
    // clicks the element by default (see its `skipClick` option), which would
    // discard the manual selection below before typing a single key — pass
    // `skipClick: true` to type in place instead of re-clicking to the end.
    input.setSelectionRange(1, 1);
    await userEvent.type(input, '2', { skipClick: true });
    await expect(input.selectionStart).toBe(2);

    // Leave the canvas resting: the a11y addon scans the POST-play DOM, and a
    // half-typed entry keeps the ghost overlay painted under the input, which
    // axe reports as an undeterminable background. Select-all first — the
    // caret is still parked at position 2 from the assertion above.
    input.setSelectionRange(0, input.value.length);
    await userEvent.keyboard('{Backspace}');
    await expect(input.value).toBe('');
  },
};

/** Real key events, because the bug this pins was in what the mask handed back
 *  to the browser rather than in any single function. */
export const BackspaceDeletes: Story = {
  name: 'Backspace can clear the field (browser)',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
  render: () => ({ template: `<div style="${COL}"><mud-date-input label="Date" /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Date') as HTMLInputElement;

    await userEvent.type(input, '15042026');
    await expect(input.value).toBe('15/04/2026');

    // An eagerly-appended separator made this loop unable to get past '15/04/':
    // Backspace removed the '/', the re-mask put it straight back, and the user
    // could never delete the month, never the day, and never clear the field.
    await userEvent.keyboard('{Backspace>10/}');

    await expect(input.value).toBe('');
  },
};

export const PopoverKeyboard: Story = {
  name: 'Alt+Down opens and Escape restores focus (browser)',
  tags: ['!autodocs'],
  parameters: { controls: { disable: true } },
  render: () => ({ template: `<div style="${COL}"><mud-date-input label="Date" /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Date') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');

    const dialog = document.querySelector('[role="dialog"]')!;

    await expect(dialog).toBeTruthy();
    await expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
    await expect(document.activeElement).toBe(input);
  },
};
