import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  linkedSignal,
  model,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import {
  addDays,
  addMonths,
  compareIso,
  dayOfWeek,
  isValidIso,
  isWithin,
  mudDateToDate,
  mudToday,
  normalizeRange,
  startOfMonth,
  toIso,
  toValidIsoOrUndefined,
} from './date-core';
import { buildDayGrid, buildYearPage, weekdayOrder, YEAR_PAGE, yearPageStart } from './date-grid';
import type {
  MudDateMonthChange,
  MudDatePickerAppearance,
  MudDatePickerHeaderStyle,
  MudDatePickerMode,
  MudDatePickerView,
  MudDateRange,
  MudDateValue,
} from './date-value';
import { _MudInputFieldStyles, MudStyleLoader } from 'ngx-mud-ui/core';
import { _safeLocale, injectMudFormatLocale, injectMudLabels } from 'ngx-mud-ui/i18n';

declare const ngDevMode: boolean | undefined;

let nextUniqueId = 0;

/**
 * Day-of-month of a Sunday, used to render localized weekday names: 2024-01-07
 * is a Sunday, so indices 0–6 map to Jan 7–13, all inside one month.
 */
const WEEKDAY_ANCHOR_DAY = 7;

/**
 * ```html
 * <mud-date-picker [(value)]="date" />
 * ```
 */
@Component({
  selector: 'mud-date-picker',
  templateUrl: './mud-date-picker.component.html',
  styleUrl: './mud-date-picker.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_hostClasses()',
    '[attr.role]': 'ariaLabel() ? "group" : null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudDatePicker),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// `FormValueControl<TValue>` types its optional `min`/`max` slots as
// `NonNullable<TValue> | undefined` — i.e. shaped like the *value*. Ours are
// always ISO date scalars regardless of mode (a range's min is still a single
// date, not a `MudDateRange`), so they can never structurally satisfy that
// slot for a generic `M`, and are Omit'd below to keep the class compiling.
// That Omit is a COMPILE-TIME-ONLY fix: the signal-forms `Field` directive
// binds `min`/`max` by matching input NAME at runtime (see
// `@angular/forms/fesm2022/signals.mjs`, `customControlCreate` /
// `CONTROL_BINDING_NAMES`), which has no notion of the TypeScript interface
// this class claims to implement. A schema calling `min(field, …)` on a
// range- or multi-mode field can still route a `MudDateRange`/`string[]`
// into this `string`-typed input, with no compile-time check to catch it.
// `_minIso`/`_maxIso` below are what actually guard `_isDisabled` against that.
export class MudDatePicker<M extends MudDatePickerMode = 'single'>
  implements ControlValueAccessor, Omit<FormValueControl<MudDateValue<M>>, 'min' | 'max'>
{
  /** @description Selection mode. Drives the shape of `value`. */
  readonly mode = input<M>('single' as M);

  /** @description Selected value. Two-way bindable; driven by both forms systems. */
  readonly value = model<MudDateValue<M>>(null as MudDateValue<M>);

  /** @description `flat` drops the card shadow, for a calendar inside your own surface. */
  readonly appearance = input<MudDatePickerAppearance>('elevated');

  /** @description `title` cycles views from one button; `dropdown` shows month + year chips. */
  readonly headerStyle = input<MudDatePickerHeaderStyle>('title');

  /** @description Inclusive lower bound, ISO `YYYY-MM-DD`. */
  readonly min = input<string | undefined>(undefined);

  /** @description Inclusive upper bound, ISO `YYYY-MM-DD`. */
  readonly max = input<string | undefined>(undefined);

  /** @description ISO dates to disable, e.g. public holidays. */
  readonly disabledDates = input<readonly string[]>([]);

  /** @description Return `true` for a SELECTABLE date. Runs after min/max/disabledDates. */
  readonly dateFilter = input<((iso: string) => boolean) | undefined>(undefined);

  /** @description Week start: 0 = Sunday, 1 = Monday (the RO/EU convention). */
  readonly firstDayOfWeek = input(1);

  /** @description BCP 47 locale for weekday and month names. Defaults to the format locale. */
  readonly locale = input<string | undefined>(undefined);

  /** @description Month to show initially, without selecting anything. */
  readonly startAt = input<string | undefined>(undefined);

  /** @description Show the "Today" quick-jump shortcut. */
  readonly showTodayShortcut = input(true, { transform: booleanAttribute });

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Accessible name for the whole calendar. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** Emitted when the visible month changes. `month` is 0-indexed. */
  readonly monthChange = output<MudDateMonthChange>();

  /** Signal-forms touch contract. */
  readonly touch = output<void>();

  private readonly _allLabels = injectMudLabels();
  private readonly _formatLocale = injectMudFormatLocale();
  protected readonly _labels = computed(() => this._allLabels().datePicker);

  protected readonly _id = `mud-date-picker-${nextUniqueId++}`;
  protected readonly _titleId = `${this._id}-title`;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: MudDateValue<M>) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  protected readonly _today = mudToday();

  /** The `locale` input when valid, else the live format locale. */
  protected readonly _activeLocale = computed(() => _safeLocale(this.locale(), this._formatLocale()));

  /** Day and year digits in the active locale, never grouped ("2026", not "2,026"). */
  private readonly _digits = computed(() => new Intl.NumberFormat(this._activeLocale(), { useGrouping: false }));

  protected _formatNumber(value: number): string {
    return this._digits().format(value);
  }

  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());
  protected readonly _effectiveInvalid = computed(() => this.invalid());

  /** Bounds arriving from a signal-forms schema are name-matched at runtime and
   *  are not type-checked, so anything that is not an ISO date is ignored. */
  private readonly _minIso = computed(() => toValidIsoOrUndefined(this.min()));

  private readonly _maxIso = computed(() => toValidIsoOrUndefined(this.max()));

  /** Pointer-hover target, for previewing a pending range. */
  protected readonly _rangeHover = signal<string | null>(null);

  /** Normalized `{ start, end }` for range mode; both null otherwise. */
  protected readonly _range = computed<MudDateRange>(() => {
    if (this.mode() !== 'range') return { start: null, end: null };

    const value = this.value() as MudDateRange | null;
    const start = value?.start && isValidIso(value.start) ? value.start : null;
    const end = value?.end && isValidIso(value.end) ? value.end : null;

    return { start, end };
  });

  /** The range as currently displayed, including an in-progress hover preview. */
  private readonly _previewRange = computed<MudDateRange>(() => {
    const { start, end } = this._range();
    const hover = this._rangeHover();

    if (!start || end || !hover) return { start, end };

    return compareIso(hover, start) < 0 ? { start: hover, end: start } : { start, end: hover };
  });

  /**
   * Selected ISO dates, normalized across modes.
   */
  protected readonly _selected = computed<readonly string[]>(() => {
    const value = this.value();

    switch (this.mode()) {
      case 'range': {
        const { start, end } = this._range();

        return [start, end].filter((iso): iso is string => iso !== null);
      }
      case 'multi':
        return Array.isArray(value) ? value.filter(isValidIso) : [];
      default:
        return typeof value === 'string' && isValidIso(value) ? [value] : [];
    }
  });

  /**
   * The date the user most recently picked. Preferred over `_selected()[0]` as
   * the anchor because in multi mode that FIRST entry moves: deselecting the
   * earliest of `['2026-08-05', '2026-12-20']` promotes December, which would
   * re-page the visible month and the roving focus out from under a user who is
   * still working in August.
   */
  private readonly _lastPicked = signal<string | null>(null);

  /** The month the calendar opens on when nothing has moved it yet. `startAt`
   *  is guarded like every other consumer-supplied ISO input: a malformed one
   *  (`"15/04/2026"` — the format the sibling FIELD displays, so an easy
   *  mistake) would otherwise make `_viewYear` NaN and have `_monthLabel`
   *  throw out of a computed during render. */
  private readonly _anchor = computed(
    () =>
      toValidIsoOrUndefined(this.startAt()) ??
      this._lastPicked() ??
      this._selected()[0] ??
      this._today,
  );

  /**
   * Visible month, as the ISO first-of-month. `linkedSignal` keeps it writable
   * for navigation while still resetting when the anchor changes — an effect
   * writing this signal would be an NG0950 violation.
   */
  protected readonly _viewIso = linkedSignal<string, string>({
    source: () => this._anchor(),
    computation: (anchor) => startOfMonth(anchor),
  });

  protected readonly _viewYear = computed(() => Number(this._viewIso().slice(0, 4)));

  protected readonly _viewYearText = computed(() => this._formatNumber(this._viewYear()));
  protected readonly _viewMonth = computed(() => Number(this._viewIso().slice(5, 7)));

  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _injector = inject(Injector);

  /** Screen-reader announcements for changes the DOM does not surface. */
  protected readonly _announcement = signal('');

  /**
   * Roving-focus target. Resets to the anchor whenever the anchor moves, and
   * is written directly by navigation — the same `linkedSignal` shape as
   * `_viewIso`, for the same NG0950 reason.
   */
  protected readonly _focusedIso = linkedSignal<string, string>({
    source: () => this._anchor(),
    computation: (anchor) => anchor,
  });

  protected readonly _weekdays = computed(() => {
    const formatterShort = new Intl.DateTimeFormat(this._activeLocale(), { weekday: 'short' });
    const formatterLong = new Intl.DateTimeFormat(this._activeLocale(), { weekday: 'long' });

    return weekdayOrder(this.firstDayOfWeek()).map((index) => {
      const date = mudDateToDate(addDaysFromAnchor(index));

      return {
        short: capitalize(formatterShort.format(date)),
        long: capitalize(formatterLong.format(date)),
      };
    });
  });

  /** Header title in days view: "August 2026". A `monthNamesLong` override
   *  replaces the month word; Intl otherwise (which also owns the word order). */
  protected readonly _monthLabel = computed(() => {
    const override = this._labels().monthNamesLong;

    if (override?.length === 12) return `${override[this._viewMonth() - 1]} ${this._viewYearText()}`;

    const formatter = new Intl.DateTimeFormat(this._activeLocale(), {
      month: 'long',
      year: 'numeric',
    });

    return capitalize(formatter.format(mudDateToDate(this._viewIso())));
  });

  protected readonly _view = signal<MudDatePickerView>('days');

  /** Twelve month names: the labels override when given, Intl otherwise. */
  private _monthNamesFor(style: 'long' | 'short'): readonly string[] {
    const override =
      style === 'long' ? this._labels().monthNamesLong : this._labels().monthNamesShort;

    if (override?.length === 12) return override;

    const formatter = new Intl.DateTimeFormat(this._activeLocale(), { month: style });

    // Month names don't depend on the year, so any fixed one does.
    // The trailing dot many locales put on short names (`ro` "nov.", `de`
    // "Aug.") is stripped: the Figma style is dotless, and the dot breaks the
    // short-is-a-prefix-of-long property that keeps the month buttons clear of
    // WCAG 2.5.3 label-in-name mismatches.
    return Array.from({ length: 12 }, (_, index) => {
      const name = formatter.format(mudDateToDate(toIso({ y: 2024, m: index + 1, d: 1 })));

      return capitalize(style === 'short' ? name.replace(/\.$/, '') : name);
    });
  }

  private readonly _monthNamesLong = computed(() => this._monthNamesFor('long'));
  private readonly _monthNamesShort = computed(() => this._monthNamesFor('short'));

  /** The grid shows the SHORT name; `fullName` is the button's accessible name. */
  protected readonly _monthCells = computed(() =>
    this._monthNamesShort().map((label, index) => ({
      label,
      fullName: this._monthNamesLong()[index],
      month: index + 1,
      selected: index + 1 === this._viewMonth(),
    })),
  );

  protected readonly _yearCells = computed(() =>
    buildYearPage(this._viewYear()).map((year) => ({
      year,
      selected: year === this._viewYear(),
    })),
  );

  /** Header text: the month+year, the year alone, or the year page range. */
  protected readonly _headerLabel = computed(() => {
    if (this._view() === 'days') return this._monthLabel();

    if (this._view() === 'months') return this._viewYearText();

    const start = yearPageStart(this._viewYear());

    return `${this._formatNumber(start)} – ${this._formatNumber(start + YEAR_PAGE - 1)}`;
  });

  /** Only the month segment, for the dropdown header style. */
  protected readonly _monthOnlyLabel = computed(
    () => this._monthNamesLong()[this._viewMonth() - 1],
  );

  /** Nav arrow accessible names: month-stepping in days view, year-stepping otherwise. */
  protected readonly _navLabels = computed(() =>
    this._view() === 'days'
      ? { prev: this._labels().previousMonth, next: this._labels().nextMonth }
      : { prev: this._labels().previousYear, next: this._labels().nextYear },
  );

  protected readonly _cells = computed(() => {
    const focused = this._focusedIso();
    const selected = this._selected();
    const { start, end } = this._previewRange();

    return buildDayGrid(this._viewYear(), this._viewMonth(), this.firstDayOfWeek()).map((cell) => ({
      ...cell,
      disabled: this._isDisabled(cell.iso),
      selected: selected.includes(cell.iso),
      today: cell.iso === this._today,
      tabbable: cell.iso === focused,
      rangeStart: !!start && cell.iso === start && !!end,
      rangeEnd: !!end && cell.iso === end,
      rangeMiddle:
        !!start && !!end && compareIso(cell.iso, start) > 0 && compareIso(cell.iso, end) < 0,
      rangeLone: !!start && cell.iso === start && !end,
    }));
  });

  /**
   * When the roving target is not on the visible page (only possible if the
   * view was paged by the header buttons), fall back to an in-month cell so
   * the grid never loses its single tab stop. Prefers an enabled cell — a
   * `disabled` button cannot receive focus — but still always returns one,
   * even when every visible day is disabled.
   */
  protected readonly _fallbackTabbableIso = computed(() => {
    const cells = this._cells();

    if (cells.some((cell) => cell.tabbable)) return null;

    const inMonth = cells.filter((cell) => !cell.outside);

    return (inMonth.find((cell) => !cell.disabled) ?? inMonth[0]).iso;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['date-picker', `date-picker--${this.appearance()}`];

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudInputFieldStyles);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        // In the effect, not the constructor: a signal-backed token can swap the
        // arrays at runtime.
        for (const key of ['monthNamesShort', 'monthNamesLong'] as const) {
          const names = this._labels()[key];

          if (names && names.length !== 12) {
            console.warn(
              `[mud-date-picker] labels.datePicker.${key} has ${names.length} entries; ` +
                `expected 12 (January first). Falling back to Intl names.`,
            );
          }
        }

        const value = this.value();

        if (typeof value === 'string' && value !== '' && !isValidIso(value)) {
          console.warn(
            `[mud-date-picker] expected an ISO date 'YYYY-MM-DD', received ${JSON.stringify(value)}. ` +
              `Use mudDateFromDate(new Date(...)) to convert. Rendering as if nothing were selected.`,
          );
        }

        const startAt = this.startAt();

        if (typeof startAt === 'string' && startAt !== '' && !isValidIso(startAt)) {
          console.warn(
            `[mud-date-picker] expected an ISO date 'YYYY-MM-DD' for startAt, received ` +
              `${JSON.stringify(startAt)}. Use mudDateFromDate(new Date(...)) to convert. ` +
              `Ignoring it and opening on the current month.`,
          );
        }
      });
    }
  }

  // ----- ControlValueAccessor -----

  /**
   * Deliberately does not run the value through `_isDisabled`: an
   * out-of-range or otherwise unselectable incoming value is still shown as
   * selected (and, separately, rendered `aria-disabled`) rather than
   * silently dropped. Silently clearing a consumer's value is the failure
   * mode this library rejects elsewhere too (see `select-input`'s orphan
   * value, which warns instead of clearing).
   */
  writeValue(value: MudDateValue<M>): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: MudDateValue<M>) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  // ----- selection -----

  protected _isDisabled(iso: string): boolean {
    if (!isWithin(iso, this._minIso(), this._maxIso())) return true;

    if (this.disabledDates().includes(iso)) return true;

    return this.dateFilter()?.(iso) === false;
  }

  protected _select(iso: string): void {
    if (this._effectiveDisabled() || this._isDisabled(iso)) return;

    this._lastPicked.set(iso);

    switch (this.mode()) {
      case 'range':
        this._selectRange(iso);
        break;
      case 'multi':
        this._selectMulti(iso);
        break;
      default:
        this._commit(iso as MudDateValue<M>);
    }
  }

  /** First click sets start; second completes; a third starts over. */
  private _selectRange(iso: string): void {
    const { start, end } = this._range();

    if (!start || end) {
      this._rangeHover.set(null);
      this._commit({ start: iso, end: null } as MudDateValue<M>);
      this._announce(this._labels().rangeStartSelected(this._dayLabel(iso)));

      return;
    }

    const range = normalizeRange(start, iso);

    this._rangeHover.set(null);
    this._commit(range as MudDateValue<M>);
    this._announce(this._labels().rangeSelected(this._dayLabel(range.start), this._dayLabel(range.end)));
  }

  private _selectMulti(iso: string): void {
    const current = this._selected();
    const next = current.includes(iso)
      ? current.filter((entry) => entry !== iso)
      : [...current, iso].sort(compareIso);

    this._commit([...next] as MudDateValue<M>);
  }

  protected _onCellEnter(iso: string): void {
    if (this.mode() !== 'range') return;

    // A preview band promising a range the click will then refuse is worse
    // than no preview at all. Clearing rather than just returning: moving the
    // pointer from an enabled day onto a disabled one would otherwise leave the
    // previous day's band drawn behind it.
    if (this._isDisabled(iso)) {
      this._rangeHover.set(null);

      return;
    }

    this._rangeHover.set(iso);
  }

  protected _onGridLeave(): void {
    this._rangeHover.set(null);
  }

  /** Localized day label used in announcements, e.g. "15 August". */
  private _dayLabel(iso: string): string {
    return new Intl.DateTimeFormat(this._activeLocale(), { day: 'numeric', month: 'long' }).format(
      mudDateToDate(iso),
    );
  }

  private _commit(value: MudDateValue<M>): void {
    this.value.set(value);
    this._onChange(value);
    this._onTouched();
    this.touch.emit();
  }

  // ----- views -----

  /** Routed through `_openView` rather than writing `_view` itself, so cycling
   *  gets the same focus repair as the dropdown chips — the title button that
   *  the user just pressed only exists while the view is NOT days in
   *  `dropdown` style, so cycling back to days destroys it. */
  protected _cycleView(): void {
    const view = this._view();

    this._openView(view === 'days' ? 'months' : view === 'months' ? 'years' : 'days');
  }

  protected _openView(view: MudDatePickerView): void {
    this._view.set(view);

    // The control that opened this view may have been inside the block just
    // torn down, so focus would otherwise fall to <body>.
    if (view === 'months') this._focusAfterRender(`[data-month="${this._viewMonth()}"] button`);
    else if (view === 'years') this._focusAfterRender(`[data-year="${this._viewYear()}"] button`);
    // Landing back on days tears down the month/year grid the press came from,
    // so focus has to be put back on the header: the month chip in `dropdown`
    // style (where the title button does not exist in days view at all), the
    // title button itself otherwise.
    else {
      this._focusAfterRender(
        this.headerStyle() === 'dropdown' ? '[data-header="month"]' : '.date-picker__title',
      );
    }
  }

  protected _selectMonth(month: number): void {
    this._viewIso.set(toIso({ y: this._viewYear(), m: month, d: 1 }));
    this._view.set('days');
    this.monthChange.emit({ year: this._viewYear(), month: month - 1 });
    this._announce(this._labels().monthChanged(this._monthLabel()));

    // `_viewIso` is already the first of the newly selected month, so
    // `_focusCell`'s own month-paging branch sees no change and does not
    // emit a second `monthChange` — this call only moves focus.
    this._focusCell(this._viewIso());
  }

  /** Years drill into months, not straight back to days — one choice at a time. */
  protected _selectYear(year: number): void {
    this._viewIso.set(toIso({ y: year, m: this._viewMonth(), d: 1 }));
    this._view.set('months');
    this._focusAfterRender(`[data-month="${this._viewMonth()}"] button`);
  }

  // ----- navigation -----

  /** Arrows step by month in days view, by year in months view, by page in years view. */
  protected _goToMonth(delta: number): void {
    const view = this._view();

    if (view === 'days') this._viewIso.set(startOfMonth(addMonths(this._viewIso(), delta)));
    else if (view === 'months') this._viewIso.set(addMonths(this._viewIso(), delta * 12));
    else this._viewIso.set(addMonths(this._viewIso(), delta * 12 * YEAR_PAGE));

    this.monthChange.emit({ year: this._viewYear(), month: this._viewMonth() - 1 });

    if (view === 'days') this._announce(this._labels().monthChanged(this._monthLabel()));
  }

  protected _goToToday(): void {
    this._focusCell(this._today);
  }

  // ----- keyboard grid navigation -----

  /**
   * Keeps the roving target in step with real DOM focus. Focus can arrive
   * without going through `_focusCell` — tabbing into the fallback cell after
   * the header paged the view — and arrow keys must continue from the cell the
   * user is actually on, not the one we last moved to.
   */
  protected _onCellFocus(iso: string): void {
    if (this._focusedIso() !== iso) this._focusedIso.set(iso);
  }

  /** Moves the roving focus, paging the view and the DOM focus along with it. */
  private _focusCell(iso: string): void {
    this._focusedIso.set(iso);

    const month = startOfMonth(iso);

    if (month !== this._viewIso()) {
      this._viewIso.set(month);
      this.monthChange.emit({ year: this._viewYear(), month: this._viewMonth() - 1 });
      this._announce(this._labels().monthChanged(this._monthLabel()));
    }

    this._focusAfterRender(`[data-iso="${iso}"] button`);
  }

  /** Focus an element that does not exist until the next render. */
  private _focusAfterRender(selector: string): void {
    afterNextRender(
      () => {
        this._host.nativeElement.querySelector<HTMLElement>(selector)?.focus();
      },
      { injector: this._injector },
    );
  }

  /** Politely announces a change the DOM does not otherwise surface. Two
   *  identical consecutive messages will not be re-announced — signal writes
   *  coalesce into one render, so there is no transient blank to reset on. */
  private _announce(message: string): void {
    this._announcement.set(message);
  }

  protected _onGridKeydown(event: KeyboardEvent): void {
    if (this._effectiveDisabled()) return;

    const iso = this._focusedIso();

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this._focusCell(addDays(iso, -1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this._focusCell(addDays(iso, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._focusCell(addDays(iso, -7));
        break;
      case 'ArrowDown':
        event.preventDefault();
        this._focusCell(addDays(iso, 7));
        break;
      // `addMonths` clamps the day when the target month is shorter, so
      // 31 August + 1 month lands on 30 September rather than nowhere.
      case 'PageUp':
        event.preventDefault();
        this._focusCell(addMonths(iso, event.shiftKey ? -12 : -1));
        break;
      case 'PageDown':
        event.preventDefault();
        this._focusCell(addMonths(iso, event.shiftKey ? 12 : 1));
        break;
      case 'Home': {
        event.preventDefault();

        const offset = (dayOfWeek(iso) - this.firstDayOfWeek() + 7) % 7;

        this._focusCell(addDays(iso, -offset));
        break;
      }
      case 'End': {
        event.preventDefault();

        const offset = (dayOfWeek(iso) - this.firstDayOfWeek() + 7) % 7;

        this._focusCell(addDays(iso, 6 - offset));
        break;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        this._select(iso);
        break;
    }
  }

  /** Moves DOM focus into the grid. Used when the popover opens. */
  focus(): void {
    this._focusCell(this._focusedIso());
  }
}

/** Nth day of the Sunday-anchored reference week, for weekday labels. */
function addDaysFromAnchor(index: number): string {
  return toIso({ y: 2024, m: 1, d: WEEKDAY_ANCHOR_DAY + index });
}

/** Romanian and many other locales render month/weekday names lowercase. */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
