import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudLabel } from 'ngx-mud-ui/label';

import { example } from '../../../example';
import { DateBasicExample } from './examples/date-basic.example';
import basicSource from './examples/date-basic.example.ts?raw';
import { DateBoundsExample } from './examples/date-bounds.example';
import boundsSource from './examples/date-bounds.example.ts?raw';
import { DateCalendarExample } from './examples/date-calendar.example';
import calendarSource from './examples/date-calendar.example.ts?raw';
import { DateFormatsExample } from './examples/date-formats.example';
import formatsSource from './examples/date-formats.example.ts?raw';
import { DateReactiveExample } from './examples/date-reactive.example';
import reactiveSource from './examples/date-reactive.example.ts?raw';
import { DateSignalFormsExample } from './examples/date-signal-forms.example';
import signalFormsSource from './examples/date-signal-forms.example.ts?raw';
import { DateHeaderExample } from './examples/date-header.example';
import headerSource from './examples/date-header.example.ts?raw';
import { DateLocalizedExample } from './examples/date-localized.example';
import localizedSource from './examples/date-localized.example.ts?raw';
import { DateRangeExample } from './examples/date-range.example';
import rangeSource from './examples/date-range.example.ts?raw';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:560px;padding:24px';

const meta: Meta<MudDateInput<'single'>> = {
  title: 'Components/Form/Date picker',
  component: MudDateInput,
  decorators: [moduleMetadata({ imports: [MudDateInput, MudLabel] })],
  argTypes: {
    format: { control: 'inline-radio', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
    headerStyle: { control: 'inline-radio', options: ['title', 'dropdown'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
  args: {
    format: 'DD/MM/YYYY',
    headerStyle: 'title',
    size: 'md',
    clearable: true,
    touchUi: false,
    disabled: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<MudDateInput<'single'>>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-date-input
        style="display:block;max-width:420px"
        [format]="format"
        [headerStyle]="headerStyle"
        [size]="size"
        [clearable]="clearable"
        [touchUi]="touchUi"
        [disabled]="disabled"
        [invalid]="invalid"
      >
        <mud-label>Data</mud-label>
      </mud-date-input>
    `,
  }),
};

export const Basic: Story = example(DateBasicExample, basicSource);
export const Formats: Story = example(DateFormatsExample, formatsSource);
export const Range: Story = example(DateRangeExample, rangeSource, {
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
});
export const Bounds: Story = example(DateBoundsExample, boundsSource);
export const Header: Story = example(DateHeaderExample, headerSource);
export const Calendar: Story = example(DateCalendarExample, calendarSource);
export const ReactiveForms: Story = example(DateReactiveExample, reactiveSource);
export const SignalForms: Story = example(DateSignalFormsExample, signalFormsSource);
export const Localized: Story = example(DateLocalizedExample, localizedSource);

/** jsdom reports no selection at all, so caret behaviour is only provable here. */
export const CaretBehaviour: Story = {
  name: 'Caret stays put while typing (browser)',
  tags: ['!autodocs', '!dev'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<div style="${COL}"><mud-date-input><mud-label>Date</mud-label></mud-date-input></div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Date') as HTMLInputElement;

    // The input must be the TOP layer, the ghost row underneath: axe's
    // color-contrast check reports "background could not be determined" for
    // any element overlapped from above.
    const rect = input.getBoundingClientRect();
    const top = document.elementsFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    )[0];

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
  tags: ['!autodocs', '!dev'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<div style="${COL}"><mud-date-input><mud-label>Date</mud-label></mud-date-input></div>`,
  }),
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
  tags: ['!autodocs', '!dev'],
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `<div style="${COL}"><mud-date-input><mud-label>Date</mud-label></mud-date-input></div>`,
  }),
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
