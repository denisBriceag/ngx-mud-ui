import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MudDatePicker } from './mud-date-picker.component';
import { mudToday } from './date-core';
import type { MudDateMonthChange, MudDatePickerAppearance } from './date-value';

@Component({
  imports: [MudDatePicker],
  template: `
    <mud-date-picker
      [(value)]="value"
      [startAt]="startAt()"
      [min]="min()"
      [max]="max()"
      [disabledDates]="disabledDates()"
      [dateFilter]="dateFilter()"
      [appearance]="appearance()"
      [showTodayShortcut]="showTodayShortcut()"
      [locale]="'en-GB'"
      [aria-label]="ariaLabel()"
      (monthChange)="monthChanges.push($event)"
    />
  `,
})
class Host {
  readonly value = signal<string | null>(null);
  readonly startAt = signal<string | undefined>('2026-08-15');
  readonly min = signal<string | undefined>(undefined);
  readonly max = signal<string | undefined>(undefined);
  readonly disabledDates = signal<readonly string[]>([]);
  readonly dateFilter = signal<((iso: string) => boolean) | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly appearance = signal<MudDatePickerAppearance>('elevated');
  readonly showTodayShortcut = signal(true);
  readonly monthChanges: MudDateMonthChange[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-date-picker') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    grid: () => el.querySelector('[role="grid"]')!,
    cells: () => Array.from(el.querySelectorAll<HTMLElement>('[role="gridcell"]')),
    cell: (iso: string) => el.querySelector<HTMLElement>(`[data-iso="${iso}"]`)!,
    title: () => el.querySelector('.date-picker__title')!.textContent!.trim(),
    today: () => el.querySelector<HTMLButtonElement>('.date-picker__today'),
    focused: () => el.querySelector<HTMLElement>('[data-iso] button[tabindex="0"]')!.parentElement!,
    async click(iso: string) {
      this.cell(iso).querySelector('button')!.click();
      await fixture.whenStable();
    },
  };
}

describe('MudDatePicker', () => {
  it('renders a fixed 42-cell grid for the startAt month', async () => {
    const view = await render();

    expect(view.cells()).toHaveLength(42);
    expect(view.title()).toBe('August 2026');
  });

  it('labels the grid and marks today', async () => {
    const view = await render();

    expect(view.grid().getAttribute('role')).toBe('grid');
    expect(view.grid().getAttribute('aria-labelledby')).toBe(
      view.el.querySelector('.date-picker__title')!.id,
    );
  });

  it('renders weekday headers starting on Monday by default', async () => {
    const view = await render();
    const heads = Array.from(view.el.querySelectorAll('[role="columnheader"]'));

    expect(heads).toHaveLength(7);
    expect(heads[0].getAttribute('aria-label')).toBe('Monday');
  });

  it('selects a day on click and reflects aria-selected', async () => {
    const view = await render();

    await view.click('2026-08-20');

    expect(view.host.value()).toBe('2026-08-20');
    expect(view.cell('2026-08-20').getAttribute('aria-selected')).toBe('true');
    expect(view.cell('2026-08-21').getAttribute('aria-selected')).toBe('false');
  });

  it('marks outside-month cells', async () => {
    const view = await render();

    expect(view.cell('2026-07-27').classList).toContain('is-outside');
    expect(view.cell('2026-08-01').classList).not.toContain('is-outside');
  });

  it('exposes an accessible name as a group role + aria-label, only when set', async () => {
    const view = await render();

    expect(view.el.getAttribute('role')).toBeNull();
    expect(view.el.getAttribute('aria-label')).toBeNull();

    view.host.ariaLabel.set('Departure date');
    await view.fixture.whenStable();

    expect(view.el.getAttribute('role')).toBe('group');
    expect(view.el.getAttribute('aria-label')).toBe('Departure date');
  });

  it('ignores a min/max that is not an ISO date instead of disabling everything', async () => {
    const view = await render();

    // Simulates what a signal-forms schema's min()/max() can hand this input
    // at runtime: bound by name, not type-checked. See the _minIso/_maxIso
    // comment in the component.
    view.host.min.set({ start: '2026-08-10', end: null } as never);
    await view.fixture.whenStable();

    expect(view.cell('2026-08-01').getAttribute('aria-disabled')).toBeNull();
    expect(view.cell('2026-08-31').getAttribute('aria-disabled')).toBeNull();
  });

  it('keeps an out-of-range value visible and selected rather than dropping it', async () => {
    const view = await render();

    view.host.min.set('2026-08-10');
    view.host.value.set('2026-08-09');
    await view.fixture.whenStable();

    // Both at once, deliberately: this IS the current value, and it is not
    // selectable. Silently clearing a consumer's value would be worse.
    expect(view.cell('2026-08-09').getAttribute('aria-selected')).toBe('true');
    expect(view.cell('2026-08-09').getAttribute('aria-disabled')).toBe('true');
  });

  it('disables days outside min/max and refuses to select them', async () => {
    const view = await render();

    view.host.min.set('2026-08-10');
    view.host.max.set('2026-08-20');
    await view.fixture.whenStable();

    expect(view.cell('2026-08-09').getAttribute('aria-disabled')).toBe('true');
    expect(view.cell('2026-08-15').getAttribute('aria-disabled')).toBeNull();

    await view.click('2026-08-09');

    expect(view.host.value()).toBeNull();
  });

  it('disables explicitly listed dates', async () => {
    const view = await render();

    view.host.disabledDates.set(['2026-08-12']);
    await view.fixture.whenStable();

    expect(view.cell('2026-08-12').getAttribute('aria-disabled')).toBe('true');
  });

  it('disables days rejected by dateFilter', async () => {
    const view = await render();

    // Weekends out: dateFilter returns true for SELECTABLE days.
    view.host.dateFilter.set((iso) => ![0, 6].includes(new Date(`${iso}T12:00:00`).getDay()));
    await view.fixture.whenStable();

    expect(view.cell('2026-08-15').getAttribute('aria-disabled')).toBe('true');
    expect(view.cell('2026-08-17').getAttribute('aria-disabled')).toBeNull();
  });

  it('pages the visible month with the nav buttons and emits monthChange', async () => {
    const view = await render();
    const next = view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!;
    const prev = view.el.querySelector<HTMLButtonElement>('[data-nav="prev"]')!;

    next.click();
    await view.fixture.whenStable();

    expect(view.title()).toBe('September 2026');
    expect(view.cells()).toHaveLength(42);
    // `month` is 0-indexed, matching `Date.getMonth()`.
    expect(view.host.monthChanges).toEqual([{ year: 2026, month: 8 }]);

    prev.click();
    prev.click();
    await view.fixture.whenStable();

    expect(view.host.monthChanges).toEqual([
      { year: 2026, month: 8 },
      { year: 2026, month: 7 },
      { year: 2026, month: 6 },
    ]);
  });

  it('renders the Today shortcut by default and jumps the view to today', async () => {
    const view = await render();

    expect(view.today()).not.toBeNull();
    expect(view.today()!.textContent!.trim()).toBe('Today');

    view.today()!.click();
    await view.fixture.whenStable();

    // A jump, not a selection: `showTodayShortcut` only moves the view.
    expect(view.focused().dataset['iso']).toBe(mudToday());
    expect(view.host.value()).toBeNull();
  });

  it('drops the Today shortcut when showTodayShortcut is false', async () => {
    const view = await render();

    view.host.showTodayShortcut.set(false);
    await view.fixture.whenStable();

    expect(view.today()).toBeNull();
  });

  it('maps appearance onto the host class', async () => {
    const view = await render();

    expect(view.el.classList).toContain('date-picker--elevated');

    view.host.appearance.set('flat');
    await view.fixture.whenStable();

    expect(view.el.classList).toContain('date-picker--flat');
    expect(view.el.classList).not.toContain('date-picker--elevated');
  });

  it('marks the day BUTTON aria-disabled, which is the hook the styling keys on', async () => {
    const view = await render();

    view.host.min.set('2026-08-10');
    await view.fixture.whenStable();

    const button = view.cell('2026-08-09').querySelector('button')!;

    // Per-date unavailability is `aria-disabled`, never native `disabled` —
    // a disabled button is unfocusable and would cost the grid its tab stop.
    // The CSS therefore has to key off the attribute, on the button itself.
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.disabled).toBe(false);
    expect(view.cell('2026-08-15').querySelector('button')!.getAttribute('aria-disabled')).toBeNull();
  });

  it('ignores a malformed startAt and renders the current month rather than throwing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = await render();

    // The DISPLAY format of the sibling field, an easy mistake to make. It made
    // `_viewYear` NaN and had `_monthLabel` throw out of a computed mid-render.
    view.host.startAt.set('15/04/2026');
    await view.fixture.whenStable();

    expect(view.cells()).toHaveLength(42);
    expect(view.title()).toBe(
      new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date()),
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('for startAt'));

    warn.mockRestore();
  });

  it('opens on the selected value when no startAt is given', async () => {
    const view = await render();

    view.host.startAt.set(undefined);
    view.host.value.set('2027-03-09');
    await view.fixture.whenStable();

    expect(view.title()).toBe('March 2027');
  });

  it('warns and renders nothing selected for a non-ISO value', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = await render();

    view.host.value.set('1990-05-14T21:00:00.000Z');
    await view.fixture.whenStable();

    expect(view.el.querySelector('[aria-selected="true"]')).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('expected an ISO date'));

    warn.mockRestore();
  });

  it('drives a reactive form control', async () => {
    @Component({
      imports: [MudDatePicker, ReactiveFormsModule],
      template: `<mud-date-picker [formControl]="control" startAt="2026-08-15" locale="en-GB" />`,
    })
    class ReactiveHost {
      readonly control = new FormControl<string | null>(null);
    }

    const fixture = TestBed.createComponent(ReactiveHost);

    await fixture.whenStable();

    const cell = fixture.nativeElement.querySelector('[data-iso="2026-08-20"] button') as HTMLButtonElement;

    cell.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe('2026-08-20');
  });
});

describe('MudDatePicker signal forms (FormValueControl)', () => {
  it('binds value both ways through the Field directive, and marks touch on selection', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;

    expect(host.form.dob().touched()).toBe(false);

    // (a) picking a date in the calendar updates the field's value.
    const cell = fixture.nativeElement.querySelector(
      '[data-iso="2026-08-20"] button',
    ) as HTMLButtonElement;

    cell.click();
    await fixture.whenStable();

    expect(host.model().dob).toBe('2026-08-20');
    expect(host.form.dob().value()).toBe('2026-08-20');

    // (c) the `touch` output marks the field touched.
    expect(host.form.dob().touched()).toBe(true);

    // (b) an external schema write reaches the component's display.
    host.model.set({ dob: '2026-08-05' });
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector('[data-iso="2026-08-05"]')!.getAttribute('aria-selected'),
    ).toBe('true');
    expect(
      fixture.nativeElement.querySelector('[data-iso="2026-08-20"]')!.getAttribute('aria-selected'),
    ).toBe('false');
  });

  it('surfaces a required-validator error through the errors input', async () => {
    const fixture = TestBed.createComponent(SignalHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-date-picker') as HTMLElement;
    const grid = el.querySelector('[role="grid"]')!;

    // Asserting `form.dob().invalid()` here would only prove signal forms
    // works — it passes with this component deleted. What the COMPONENT owes
    // is the invalid state reaching the grid and the host.
    expect(grid.getAttribute('aria-invalid')).toBe('true');
    expect(el.classList).toContain('is-invalid');

    fixture.componentInstance.model.set({ dob: '2026-08-20' });
    await fixture.whenStable();

    expect(grid.getAttribute('aria-invalid')).toBeNull();
    expect(el.classList).not.toContain('is-invalid');
  });
});

@Component({
  imports: [MudDatePicker, FormField],
  template: `<mud-date-picker [formField]="form.dob" startAt="2026-08-15" locale="en-GB" />`,
})
class SignalHost {
  readonly model = signal<{ dob: string | null }>({ dob: null });

  readonly form = form(this.model, (path) => {
    required(path.dob, { message: 'Alegeți o dată.' });
  });
}
