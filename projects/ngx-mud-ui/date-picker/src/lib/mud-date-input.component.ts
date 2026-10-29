import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import type { ElementRef, TemplateRef, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Overlay } from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { isValidIso, isWithin, normalizeRange, toValidIsoOrUndefined } from './date-core';
import {
  caretForDigitIndex,
  digitsBefore,
  displayToIso,
  formatMasked,
  formatSpec,
  isoToDisplay,
} from './date-mask';
import type { MudDateFormat, MudDateFormatSpec } from './date-mask';
import { MudDatePicker } from './mud-date-picker.component';
import type {
  MudDateInputMode,
  MudDatePickerHeaderStyle,
  MudDateRange,
  MudDateValue,
} from './date-value';
import { _MudInputFieldStyles, MudStyleLoader } from 'ngx-mud-ui/core';
import { injectMudLabels } from 'ngx-mud-ui/i18n';

declare const ngDevMode: boolean | undefined;

export type MudDateInputSize = 'md' | 'lg';
export type MudDateInputVariant = 'default' | 'warning' | 'destructive' | 'success';

let nextUniqueId = 0;

/** The shape a placeholder must have for a format: its separators in place, a non-digit everywhere else. */
function placeholderShape(spec: MudDateFormatSpec): RegExp {
  const separator = spec.separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = Array.from(spec.format, (char) =>
    char === spec.separator ? separator : `[^\\d${separator}]`,
  ).join('');

  return new RegExp(`^${body}$`);
}

/**
 * ```html
 * <mud-date-input [formField]="form.dob" required>
 *   <mud-label>Data nașterii</mud-label>
 *   @if (form.dob().touched() && form.dob().invalid()) {
 *     <mud-inline-message variant="error">Alegeți o dată.</mud-inline-message>
 *   }
 * </mud-date-input>
 * ```
 */
@Component({
  selector: 'mud-date-input',
  templateUrl: './mud-date-input.component.html',
  styleUrl: './mud-date-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [MudDatePicker, CdkTrapFocus],
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudDateInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudDateInput<M extends MudDateInputMode = 'single'>
  implements ControlValueAccessor, Omit<FormValueControl<MudDateValue<M>>, 'min' | 'max'>
{
  /** @description `single` (default) or `range`. Range renders two masked fields. */
  readonly mode = input<M>('single' as M);

  /** @description ISO `YYYY-MM-DD` for single mode; `{ start, end }` for range. */
  readonly value = model<MudDateValue<M>>(null as MudDateValue<M>);

  /** @description Entry and display order. */
  readonly format = input<MudDateFormat>('DD/MM/YYYY');

  /** @description Whether the calendar popover is open. Two-way bindable. */
  readonly open = model(false);

  /** @description Calendar header: `title` or month/year `dropdown`s. Defaults to `dropdown` with `touchUi`, else `title`. */
  readonly headerStyle = input<MudDatePickerHeaderStyle | undefined>(undefined);

  /** @description Opens the calendar as a centred dialog over a backdrop, for touch screens. */
  readonly touchUi = input(false, { transform: booleanAttribute });

  /** @description Trailing clear (×) button, shown only while the field holds a value. */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @description Color treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudDateInputVariant>('default');
  /** @description Height and text size: `md` (40px) or `lg` (48px). */
  readonly size = input<MudDateInputSize>('md');
  /** @description Disables the field. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Adds the red asterisk to the label and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });
  /** @description Read-only: the date stays focusable and copyable; the calendar doesn't open. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** @description Native `name` attribute. */
  readonly name = input<string>('');
  /** @description Empty-state and typing-ghost pattern matching the format's shape (e.g. `ZZ/LL/AAAA`). */
  readonly placeholder = input<string | undefined>(undefined);
  /** @description Accessible name used when no `mud-label` is projected. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** @description Extra id(s) merged into the input's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Inclusive lower bound, ISO `YYYY-MM-DD`; earlier dates are refused. */
  readonly min = input<string | undefined>(undefined);
  /** @description Inclusive upper bound, ISO `YYYY-MM-DD`; later dates are refused. */
  readonly max = input<string | undefined>(undefined);
  /** @description ISO dates that can't be picked, such as public holidays. */
  readonly disabledDates = input<readonly string[]>([]);
  /** @description Returns `true` for a date that can be picked, such as weekdays only. */
  readonly dateFilter = input<((iso: string) => boolean) | undefined>(undefined);
  /** @description Week start in the calendar: 0 = Sunday, 1 = Monday. */
  readonly firstDayOfWeek = input(1);
  /** @description BCP 47 locale for month and weekday names. Defaults to the format locale. */
  readonly locale = input<string | undefined>(undefined);

  /** @description Fires after the clear button empties the field. */
  readonly cleared = output<void>();
  readonly touch = output<void>();

  private readonly _allLabels = injectMudLabels();
  protected readonly _labels = computed(() => this._allLabels().datePicker);
  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly _native = viewChild<ElementRef<HTMLInputElement>>('native');
  private readonly _startNative = viewChild<ElementRef<HTMLInputElement>>('startNative');
  private readonly _endNative = viewChild<ElementRef<HTMLInputElement>>('endNative');
  private readonly _panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly _picker = viewChild(MudDatePicker);

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-date-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;
  protected readonly _hintId = `${this._id}-hint`;
  protected readonly _dialogId = `${this._id}-dialog`;
  protected readonly _nameId = `${this._id}-name`;
  protected readonly _startSegmentId = `${this._id}-start-label`;
  protected readonly _endSegmentId = `${this._id}-end-label`;

  protected readonly _focused = signal(false);
  private _overlayRef: OverlayRef | null = null;

  /** @docs-private Whether the open panel was attached as a touchUi dialog. */
  protected readonly _touchPanel = signal(false);

  protected readonly _headerStyle = computed<MudDatePickerHeaderStyle>(
    () => this.headerStyle() ?? (this._touchPanel() ? 'dropdown' : 'title'),
  );

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: MudDateValue<M>) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  protected readonly _spec = computed(() => formatSpec(this.format()));

  protected readonly _pattern = computed(() => {
    const custom = this.placeholder()?.trim();

    return custom && placeholderShape(this._spec()).test(custom) ? custom : this._spec().format;
  });

  /** The single-mode ISO value, or null when unset/unusable. */
  protected readonly _valueIso = computed<string | null>(() => {
    const value = this.value();

    return typeof value === 'string' && isValidIso(value) ? value : null;
  });

  protected readonly _minIso = computed(() => toValidIsoOrUndefined(this.min()));

  protected readonly _maxIso = computed(() => toValidIsoOrUndefined(this.max()));

  protected readonly _draft = linkedSignal<string, string>({
    source: () => this._draftKey(this._valueIso()),
    computation: (key, previous) => this._draftFromKey(key, previous),
  });

  protected readonly _ghost = computed(() => this._pattern().slice(this._draft().length));

  protected readonly _isRange = computed(() => this.mode() === 'range');

  protected readonly _range = computed<MudDateRange>(() => {
    const value = this.value() as MudDateRange | null;

    return {
      start: value?.start && isValidIso(value.start) ? value.start : null,
      end: value?.end && isValidIso(value.end) ? value.end : null,
    };
  });

  private _draftKey(iso: string | null): string {
    return `${iso ?? ''}|${this.format()}`;
  }

  private _draftFromKey(key: string, previous?: { source: string; value: string }): string {
    if (previous && previous.source === key) return previous.value;

    const iso = key.slice(0, key.indexOf('|'));

    return iso ? isoToDisplay(iso, this._spec()) : '';
  }

  protected readonly _startDraft = linkedSignal<string, string>({
    source: () => this._draftKey(this._range().start),
    computation: (key, previous) => this._draftFromKey(key, previous),
  });

  protected readonly _endDraft = linkedSignal<string, string>({
    source: () => this._draftKey(this._range().end),
    computation: (key, previous) => this._draftFromKey(key, previous),
  });

  protected readonly _startGhost = computed(() => this._pattern().slice(this._startDraft().length));
  protected readonly _endGhost = computed(() => this._pattern().slice(this._endDraft().length));

  private _lastValueIso: string | null = null;
  private _lastStartIso: string | null = null;
  private _lastEndIso: string | null = null;

  private _lastEmitted: MudDateValue<M> = null as MudDateValue<M>;

  private _movingFocusInternally = false;

  /** The month the popover calendar opens on. */
  protected readonly _pickerStartAt = computed(() =>
    this._isRange() ? (this._range().start ?? undefined) : (this._valueIso() ?? undefined),
  );

  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());
  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _effectiveVariant = computed<MudDateInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  protected readonly _showClear = computed(() => {
    if (!this.clearable() || this._effectiveDisabled() || this.readonly()) return false;

    return this._isRange()
      ? this._startDraft().length > 0 || this._endDraft().length > 0
      : this._draft().length > 0;
  });

  protected readonly _formatHint = computed(() => this._labels().formatHint(this._pattern()));

  protected readonly _describedBy = computed<string | null>(() => {
    const ids = [this._hintId];

    if (this._hasMessages()) ids.push(this._assistiveId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.join(' ');
  });

  protected readonly _ariaLabel = computed<string | null>(() =>
    this._hasLabel() ? null : (this.ariaLabel() ?? null),
  );

  protected readonly _fieldNameId = computed<string | null>(() => {
    if (this._hasLabel()) return this._labelId;

    return this._ariaLabel() ? this._nameId : null;
  });

  protected readonly _startLabelledBy = computed(() =>
    [this._fieldNameId(), this._startSegmentId].filter((id) => !!id).join(' '),
  );

  protected readonly _endLabelledBy = computed(() =>
    [this._fieldNameId(), this._endSegmentId].filter((id) => !!id).join(' '),
  );

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', 'date-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'lg') classes.push('input-field--lg');

    if (this.open()) classes.push('is-open');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudInputFieldStyles);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        const placeholder = this.placeholder()?.trim();

        if (!placeholder || placeholderShape(this._spec()).test(placeholder)) return;

        console.warn(
          `[mud-date-input] placeholder ${JSON.stringify(placeholder)} does not have the ${this.format()} shape ` +
            `(the format's separators in place, non-digits elsewhere); using the format.`,
        );
      });
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        const value = this.value();

        if (typeof value !== 'string' || value === '' || isValidIso(value)) return;

        console.warn(
          `[mud-date-input] expected an ISO date 'YYYY-MM-DD', received ${JSON.stringify(value)}. ` +
            `Use mudDateFromDate(new Date(...)) to convert. Rendering as empty.`,
        );
      });
    }

    effect(() => {
      const entries: [ElementRef<HTMLInputElement> | undefined, string][] = [
        [this._native(), this._draft()],
        [this._startNative(), this._startDraft()],
        [this._endNative(), this._endDraft()],
      ];

      if (!this._isBrowser) return;

      for (const [ref, display] of entries) {
        const native = ref?.nativeElement;

        if (native && native.value !== display) native.value = display;
      }
    });

    effect(() => {
      if (this.value() !== this._lastEmitted) this._forgetUsable();
    });

    effect(() => {
      if (!this._isBrowser) return;

      if (this.open()) this._attachPanel();
      else this._detachPanel();
    });

    inject(DestroyRef).onDestroy(() => this._detachPanel());
  }

  // ----- ControlValueAccessor -----

  writeValue(value: MudDateValue<M>): void {
    this._forgetUsable();
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

  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    if (this._isRange()) this._startNative()?.nativeElement.focus(options);
    else this._native()?.nativeElement.focus(options);
  }

  // ----- typing -----

  private _maskAndRestoreCaret(native: HTMLInputElement): string {
    const raw = native.value;
    const caret = native.selectionStart ?? raw.length;
    const masked = formatMasked(raw, this._spec());

    if (masked !== raw) {
      const digitIndex = digitsBefore(raw, caret);
      const offset = caretForDigitIndex(masked, digitIndex);

      native.value = masked;
      native.setSelectionRange?.(offset, offset);
    }

    return masked;
  }

  private _rememberUsable(): void {
    if (this._isRange()) {
      const { start, end } = this._range();

      if (start) this._lastStartIso = start;

      if (end) this._lastEndIso = end;

      return;
    }

    const iso = this._valueIso();

    if (iso) this._lastValueIso = iso;
  }

  protected _onInput(event: Event): void {
    this._rememberUsable();

    const masked = this._maskAndRestoreCaret(event.target as HTMLInputElement);

    if (masked === '') this._lastValueIso = null;

    this._commitFrom(masked);
    this._draft.set(masked);
  }

  private _commitFrom(display: string): void {
    this._emit(this._usableIso(display) as MudDateValue<M>);
  }

  protected _onSegmentInput(part: 'start' | 'end', event: Event): void {
    this._rememberUsable();

    const draft = part === 'start' ? this._startDraft : this._endDraft;

    const wasComplete = this._startDraft().length === this._spec().length;
    const masked = this._maskAndRestoreCaret(event.target as HTMLInputElement);

    // Deleting everything is a deliberate "no date": nothing to revert to.
    if (masked === '' && part === 'start') this._lastStartIso = null;
    else if (masked === '') this._lastEndIso = null;

    if (this._commitRange(part, masked)) {
      this._showRangeEndpoints();
    } else {
      draft.set(masked);
    }

    if (part === 'start' && !wasComplete && masked.length === this._spec().length) {
      this._focusSegment(this._endNative());
    }
  }

  private _focusSegment(ref: ElementRef<HTMLInputElement> | undefined): void {
    if (!ref) return;

    this._movingFocusInternally = true;

    try {
      ref.nativeElement.focus();
    } finally {
      this._movingFocusInternally = false;
    }
  }

  private _commitRange(part: 'start' | 'end', display: string): boolean {
    const startDisplay = part === 'start' ? display : this._startDraft();
    const endDisplay = part === 'end' ? display : this._endDraft();

    const first = this._usableIso(startDisplay);
    const second = this._usableIso(endDisplay);

    if (first && second) {
      const range = normalizeRange(first, second);

      this._emit(range as MudDateValue<M>);

      return range.start !== first;
    }

    this._emit({ start: first, end: second } as MudDateValue<M>);

    return false;
  }

  private _showRangeEndpoints(): void {
    const { start, end } = this._range();

    this._rewriteDraft(this._startDraft, start);
    this._rewriteDraft(this._endDraft, end);
  }

  private _usableIso(display: string): string | null {
    const iso = displayToIso(display, this._spec());

    if (!iso) return null;

    return isWithin(iso, this._minIso(), this._maxIso()) && !this._isFiltered(iso) ? iso : null;
  }

  protected _onEndKeydown(event: KeyboardEvent): void {
    const native = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && (native.selectionStart ?? 0) === 0) {
      event.preventDefault();
      this._focusSegment(this._startNative());

      return;
    }

    this._onKeydown(event);
  }

  private _isFiltered(iso: string): boolean {
    return this.disabledDates().includes(iso) || this.dateFilter()?.(iso) === false;
  }

  private _emit(value: MudDateValue<M>): void {
    this._lastEmitted = value;
    this.value.set(value);
    this._onChange(value);
  }

  private _forgetUsable(): void {
    this._lastValueIso = null;
    this._lastStartIso = null;
    this._lastEndIso = null;
  }

  /** An entry whose text is exactly the display of its committed date was not edited. */
  private _isUntouched(display: string, iso: string | null): boolean {
    return display === (iso ? isoToDisplay(iso, this._spec()) : '');
  }

  protected _onFocus(): void {
    this._focused.set(true);
  }

  protected _onBlur(part?: 'start' | 'end'): void {
    this._focused.set(false);
    this._settleOnBlur(part);
    this._onTouched();
    this.touch.emit();
  }

  private _settleOnBlur(part?: 'start' | 'end'): void {
    if (this._movingFocusInternally) return;

    if (!this._isRange()) {
      if (this._isUntouched(this._draft(), this._valueIso())) return;

      const iso = this._settledIso(this._draft(), this._lastValueIso);

      if (iso !== this._valueIso()) this._emit(iso as MudDateValue<M>);

      this._rewriteDraft(this._draft, iso);

      return;
    }

    if (!part) return;

    const current = this._range();

    if (part === 'start' && this._isUntouched(this._startDraft(), current.start)) return;

    if (part === 'end' && this._isUntouched(this._endDraft(), current.end)) return;

    const settledStart =
      part === 'start' ? this._settledIso(this._startDraft(), this._lastStartIso) : current.start;
    const settledEnd =
      part === 'end' ? this._settledIso(this._endDraft(), this._lastEndIso) : current.end;

    let start = settledStart;
    let end = settledEnd;

    // Reverting one endpoint can put it the wrong side of the other.
    if (start && end) ({ start, end } = normalizeRange(start, end));

    if (start !== current.start || end !== current.end) {
      this._emit({ start, end } as MudDateValue<M>);
    }

    if (start !== settledStart) this._showRangeEndpoints();
    else if (part === 'start') this._rewriteDraft(this._startDraft, start);
    else this._rewriteDraft(this._endDraft, end);
  }

  /** Date an entry settles on at blur: its parse, else the last usable date; `null` when emptied (never undone). */
  private _settledIso(display: string, fallback: string | null): string | null {
    if (!display) return null;

    return this._usableIso(display) ?? fallback;
  }

  /** Snaps one entry's visible text onto the date it settled on. */
  private _rewriteDraft(draft: WritableSignal<string>, iso: string | null): void {
    const display = iso ? isoToDisplay(iso, this._spec()) : '';

    if (draft() !== display) draft.set(display);
  }

  protected _onKeydown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      this._openPanel();

      return;
    }

    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this._close(false);
    }
  }

  protected _onClear(): void {
    this._forgetUsable();

    if (this._isRange()) {
      this._startDraft.set('');
      this._endDraft.set('');
      this._emit({ start: null, end: null } as MudDateValue<M>);
    } else {
      this._draft.set('');
      this._emit(null as MudDateValue<M>);
    }

    this.cleared.emit();
    this.focus();
  }

  // ----- popover -----

  protected _toggle(): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    if (this.open()) this._close();
    else this._openPanel();
  }

  private _openPanel(): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    this.open.set(true);
  }

  protected _close(returnFocus = true): void {
    this.open.set(false);

    if (returnFocus) this.focus();
  }

  protected _onPickerChange(value: string | MudDateRange | null): void {
    this._emit(value as MudDateValue<M>);

    if (!this._isRange()) {
      this._close();

      return;
    }

    const range = value as MudDateRange | null;

    if (range?.start && range.end) this._close();
  }

  protected _onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._close();
    }
  }

  private _attachPanel(): void {
    if (this._overlayRef?.hasAttached()) return;

    const control = this._control().nativeElement;
    const touch = this.touchUi();

    this._touchPanel.set(touch);

    if (touch) return this._attachTouchPanel();

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(control)
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withPush(true)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
      ]);

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    this._overlayRef.attach(new TemplatePortal(this._panelTemplate(), this._viewContainerRef));

    this._picker()?.focus();

    this._overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      if (target && !control.contains(target)) this._close(false);
    });
  }

  private _attachTouchPanel(): void {
    this._overlayRef = this._overlay.create({
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this._overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'mud-date-input-backdrop',
    });

    this._overlayRef.attach(new TemplatePortal(this._panelTemplate(), this._viewContainerRef));
    this._picker()?.focus();
    this._overlayRef.backdropClick().subscribe(() => this._close());
  }

  private _detachPanel(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }
}
