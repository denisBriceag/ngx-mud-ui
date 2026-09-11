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
  isSignal,
  linkedSignal,
  model,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewContainerRef,
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
import { MUD_DATE_LABELS } from './date-labels';
import {
  caretForDigitIndex,
  digitsBefore,
  displayToIso,
  formatMasked,
  formatSpec,
  ghostRemainder,
  isoToDisplay,
} from './date-mask';
import type { MudDateFormat } from './date-mask';
import { MudDatePicker } from './mud-date-picker.component';
import type { MudDateInputMode, MudDateRange, MudDateValue } from './date-value';

declare const ngDevMode: boolean | undefined;

export type MudDateInputSize = 'medium' | 'large';
export type MudDateInputVariant = 'default' | 'warning' | 'destructive' | 'success';

let nextUniqueId = 0;

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
// `FormValueControl<TValue>` types its optional `min`/`max` slots as
// `NonNullable<TValue> | undefined` — i.e. shaped like the *value*. Ours are
// always ISO date scalars regardless of mode (a range's min is still a single
// date, not a `MudDateRange`), so they can never structurally satisfy that
// slot for a generic `M`, and are Omit'd below to keep the class compiling.
// See `MudDatePicker` for the full rationale — same wall, same fix.
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

  /** @description Trailing clear (×) button, shown only while the field holds a value. */
  readonly clearable = input(false, { transform: booleanAttribute });

  readonly variant = input<MudDateInputVariant>('default');
  readonly size = input<MudDateInputSize>('medium');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly name = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  // Forwarded to the popover calendar.
  readonly min = input<string | undefined>(undefined);
  readonly max = input<string | undefined>(undefined);
  readonly disabledDates = input<readonly string[]>([]);
  readonly dateFilter = input<((iso: string) => boolean) | undefined>(undefined);
  readonly firstDayOfWeek = input(1);
  readonly locale = input<string | undefined>(undefined);

  readonly cleared = output<void>();
  readonly touch = output<void>();

  private readonly _labelsSource = inject(MUD_DATE_LABELS);

  /** Normalized token view: a plain object and a live signal both read here. */
  protected readonly _labels = computed(() =>
    isSignal(this._labelsSource) ? this._labelsSource() : this._labelsSource,
  );
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

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: MudDateValue<M>) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  protected readonly _spec = computed(() => formatSpec(this.format()));

  /** The single-mode ISO value, or null when unset/unusable. */
  protected readonly _valueIso = computed<string | null>(() => {
    const value = this.value();

    return typeof value === 'string' && isValidIso(value) ? value : null;
  });

  /** Bounds arriving from a signal-forms schema are name-matched at runtime and
   *  are not type-checked, so anything that is not an ISO date is ignored. Also
   *  guards `isWithin`/`compareIso`, which do bare lexicographic comparison
   *  with no format validation of their own — and are the same computeds fed
   *  to the embedded `<mud-date-picker>`, so the two can never disagree about
   *  what a malformed bound means. */
  protected readonly _minIso = computed(() => toValidIsoOrUndefined(this.min()));

  protected readonly _maxIso = computed(() => toValidIsoOrUndefined(this.max()));

  /**
   * What the input shows. A `linkedSignal` rather than an effect: it derives
   * from the committed value, resets when that value or the format changes,
   * and stays directly writable while the user types.
   *
   * The source is a primitive `"iso|format"` key, not an object — see
   * `_draftKey`/`_draftFromKey` for why a primitive key ALONE is not enough
   * and `computation` has to consult `previous` itself.
   */
  protected readonly _draft = linkedSignal<string, string>({
    source: () => this._draftKey(this._valueIso()),
    computation: (key, previous) => this._draftFromKey(key, previous),
  });

  protected readonly _ghost = computed(() => ghostRemainder(this._draft(), this._spec()));

  protected readonly _isRange = computed(() => this.mode() === 'range');

  protected readonly _range = computed<MudDateRange>(() => {
    const value = this.value() as MudDateRange | null;

    return {
      start: value?.start && isValidIso(value.start) ? value.start : null,
      end: value?.end && isValidIso(value.end) ? value.end : null,
    };
  });

  /**
   * `_range()` always returns a fresh object literal, so its `linkedSignal`
   * subscribers (`_startDraft`/`_endDraft` below, and `_draft` above through
   * `_valueIso`) are always notified of a *possible* change on every commit,
   * even one that never touches them — `Object.is` never sees two calls to
   * `_range()` as equal, object identity included. A primitive key derived
   * from just this endpoint fixes what gets PASSED to `computation`, but
   * `linkedSignal` itself does not compare the key against the previous one
   * before invoking `computation` — that comparison has to happen inside
   * `computation`, using its `previous` argument, or the draft is
   * recomputed (and a manual `.set()` write discarded) on every notification
   * regardless of whether this endpoint's key actually changed.
   */
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

  protected readonly _startGhost = computed(() => ghostRemainder(this._startDraft(), this._spec()));
  protected readonly _endGhost = computed(() => ghostRemainder(this._endDraft(), this._spec()));

  /**
   * The last usable date each entry held, which blur reverts an unusable entry
   * to — see `_settleOnBlur`. Typing an incomplete, impossible or out-of-bounds
   * date commits `null` (deliberate, and unchanged), so `value()` alone cannot
   * say what was there a keystroke earlier.
   *
   * Plain fields sampled by `_rememberUsable` rather than signals: the sample
   * has to be taken synchronously, in the same task as the keystroke that
   * destroys the value, and a `linkedSignal` only starts accumulating history
   * from the first time something reads it.
   */
  private _lastValueIso: string | null = null;
  private _lastStartIso: string | null = null;
  private _lastEndIso: string | null = null;

  /**
   * Set while the component moves focus between the two range segments itself.
   * A blur the COMPONENT caused is not the user leaving the field, so it must
   * not settle an entry the user is still editing — see `_settleOnBlur`.
   */
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

  protected readonly _formatHint = computed(() => this._labels().formatHint(this.format()));

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

  /**
   * Range mode composes each input's accessible name out of the field's own
   * name plus a per-segment sr-only span, through `aria-labelledby`.
   *
   * `aria-label="Start date"` on the inputs — what this used to do — OVERRIDES
   * the associated `<label>`, so `<mud-date-input mode="range" label="Perioada">`
   * announced "Start date" and the word "Perioada" never reached AT at all;
   * the consumer's own `[aria-label]` was equally inert. `aria-labelledby`
   * concatenates instead, and pointing it at the real `<label>` element keeps
   * projected `<mud-label>` content, which string concatenation would drop.
   *
   * `null` when the field has neither a label nor an `aria-label`: the segment
   * name alone is then the accessible name.
   */
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

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this.open()) classes.push('is-open');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;

      const value = this.value();

      if (typeof value !== 'string' || value === '' || isValidIso(value)) return;

      console.warn(
        `[mud-date-input] expected an ISO date 'YYYY-MM-DD', received ${JSON.stringify(value)}. ` +
          `Use mudDateFromDate(new Date(...)) to convert. Rendering as empty.`,
      );
    });

    // Keeps each input's live `value` PROPERTY in step with its draft. The
    // template binds `[attr.value]`, which the browser stops honouring the
    // moment the user types into the field (the dirty value flag), so every
    // rewrite the COMPONENT decides on — a clear, an external value write, a
    // blur revert, a normalizing range swap — has to reach the DOM from here.
    // Writing only on a real difference is what keeps this from stamping on the
    // caret mid-typing. Same shape as `phone-input`'s display sync.
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
      if (!this._isBrowser) return;

      if (this.open()) this._attachPanel();
      else this._detachPanel();
    });

    inject(DestroyRef).onDestroy(() => this._detachPanel());
  }

  // ----- ControlValueAccessor -----

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

  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    if (this._isRange()) this._startNative()?.nativeElement.focus(options);
    else this._native()?.nativeElement.focus(options);
  }

  // ----- typing -----

  /**
   * Re-masks what the native input now holds and puts the caret back after the
   * digit the user just touched — re-masking rewrites the whole field, which
   * would otherwise fling the caret to the end. Returns the masked display.
   *
   * Shared by both entry paths on purpose: the single field and each range
   * segment ran two copies of this, in inverted statement order, which is how
   * a caret fix lands in one and not the other. jsdom cannot observe selection
   * at all; the browser-mode story from Task 14 is what covers this.
   */
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

  /**
   * Snapshots the dates the field holds RIGHT NOW, before the commit below can
   * replace one of them with `null`. Reading the live committed value here is
   * what makes external writes (a form patch, `writeValue`) count too, with no
   * second bookkeeping path to keep in sync.
   */
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

    // Commit BEFORE writing the draft: committing an incomplete entry emits
    // null, which is `_draft`'s linkedSignal source, and a source change
    // discards any manual write that preceded it. Writing the draft last
    // ensures the visible ghost/clear-button state reflects what was just
    // typed rather than snapping back to empty for a render.
    this._commitFrom(masked);
    this._draft.set(masked);
  }

  private _commitFrom(display: string): void {
    this._emit(this._usableIso(display) as MudDateValue<M>);
  }

  protected _onSegmentInput(part: 'start' | 'end', event: Event): void {
    this._rememberUsable();

    const draft = part === 'start' ? this._startDraft : this._endDraft;

    // Captured before any write below: the handoff to the end field must
    // fire only on the transition into completeness, not on every keystroke
    // that happens to leave a start segment at full length (e.g. fixing one
    // digit of an already-complete date via the caret, not by typing at the
    // end of it).
    const wasComplete = this._startDraft().length === this._spec().length;
    const masked = this._maskAndRestoreCaret(event.target as HTMLInputElement);

    // Commit BEFORE writing the draft, same reasoning as `_onInput`: an emit
    // sets `value` to a freshly-built `{ start, end }` object, which is a new
    // reference every time and so is always seen as "changed" — that resets
    // BOTH `_startDraft` and `_endDraft`'s linkedSignal, discarding a manual
    // write that preceded it. `_commitRange` takes the just-masked display
    // explicitly (the OTHER segment's draft signal is already current) so it
    // does not need to read this segment's draft before it has been written.
    if (this._commitRange(part, masked)) {
      // A normalizing swap moved BOTH committed endpoints, so writing the typed
      // text back into this segment would pin the field to the pre-swap order.
      this._showRangeEndpoints();
    } else {
      draft.set(masked);
    }

    // A start segment BECOMING complete hands off to the end field, so the
    // user keeps typing without reaching for the mouse or Tab. Correcting an
    // already-complete start (still full length afterwards) must not steal
    // focus mid-edit.
    //
    // Deliberately NOT gated on the entry being usable: auto-advance is about
    // the user having typed ten digits, not about whether those digits name a
    // date this field accepts. `_focusSegment` is what keeps the handoff from
    // settling the entry it just left.
    if (part === 'start' && !wasComplete && masked.length === this._spec().length) {
      this._focusSegment(this._endNative());
    }
  }

  /**
   * Moves focus between the two range segments. `focus()` dispatches `blur` on
   * the outgoing input SYNCHRONOUSLY, before it returns, so the flag is still
   * set while `_settleOnBlur` runs and the `finally` reset cannot strand it.
   *
   * Without this, completing a REFUSED date in the start segment (`31/02/2026`,
   * or anything outside `min`/`max`) handed off to the end field and blanked
   * the start field on the way out — the blur revert firing on the very entry
   * the user was still working in.
   */
  private _focusSegment(ref: ElementRef<HTMLInputElement> | undefined): void {
    if (!ref) return;

    this._movingFocusInternally = true;

    try {
      ref.nativeElement.focus();
    } finally {
      this._movingFocusInternally = false;
    }
  }

  /**
   * Commits both endpoints. Returns whether the endpoints had to be SWAPPED,
   * which the caller needs in order to stop rewriting the typed text over the
   * new order.
   *
   * Entering the later date first still yields a valid range — the calendar
   * swaps the endpoints too, through this same `normalizeRange` helper, so the
   * field and the calendar cannot disagree about what a reversed range means.
   * Nullifying the end instead (what this used to do) both threw away a date
   * the user had just typed and left it on screen next to `end: null`.
   */
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

  /** Redraws both entries from the committed endpoints, after a swap has moved
   *  the one the user was not editing. The display-sync effect carries these
   *  into the DOM. */
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
      // Same shape as the start→end handoff: the walk-back must not settle the
      // end entry the user is deleting their way out of.
      this._focusSegment(this._startNative());

      return;
    }

    this._onKeydown(event);
  }

  private _isFiltered(iso: string): boolean {
    return this.disabledDates().includes(iso) || this.dateFilter()?.(iso) === false;
  }

  private _emit(value: MudDateValue<M>): void {
    this.value.set(value);
    this._onChange(value);
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

  /**
   * Commit-on-blur, the same contract `numeric-input` uses: leaving behind an
   * entry the field cannot use — incomplete, impossible, or refused by
   * `min`/`max`/`disabledDates`/`dateFilter` — reverts to the last usable date
   * instead of stranding the rejected text on screen next to a `null` value.
   * That also stops a refused edit from destroying the value the field already
   * held, and puts the field in step with the calendar, where an out-of-range
   * click is a plain no-op that keeps the current selection.
   *
   * Only the entry that blurred is settled: in range mode the other segment may
   * be the one focus is moving INTO, mid-entry.
   *
   * Fires only when the USER leaves a field. A blur the component caused itself
   * (`_focusSegment`, for the start→end handoff and the Backspace walk-back) is
   * not the user going anywhere, and settling then would revert the entry they
   * are still typing.
   */
  private _settleOnBlur(part?: 'start' | 'end'): void {
    if (this._movingFocusInternally) return;

    if (!this._isRange()) {
      const iso = this._settledIso(this._draft(), this._lastValueIso);

      if (iso !== this._valueIso()) this._emit(iso as MudDateValue<M>);

      this._rewriteDraft(this._draft, iso);

      return;
    }

    if (!part) return;

    const current = this._range();
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

    // A swap moved the segment the user was NOT editing as well, so both have
    // to be redrawn. Otherwise only the one that blurred: redrawing the other
    // would wipe an entry the user is still part-way through — very often the
    // one focus is moving INTO.
    if (start !== settledStart) this._showRangeEndpoints();
    else if (part === 'start') this._rewriteDraft(this._startDraft, start);
    else this._rewriteDraft(this._endDraft, end);
  }

  /**
   * The date an entry settles on when focus leaves it: what it resolves to, the
   * last usable date when it resolves to nothing, and `null` when the entry is
   * empty — deleting everything is a deliberate "no date", not a failed edit,
   * and must never be undone.
   */
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
    // An explicit clear is not a failed edit: blur must not put the cleared
    // date back, so the revert history goes with it.
    this._lastValueIso = null;
    this._lastStartIso = null;
    this._lastEndIso = null;

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

    // Single mode is done in one pick; a range closes only once both ends are set.
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
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(control)
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withPush(false)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    this._overlayRef.attach(new TemplatePortal(this._panelTemplate(), this._viewContainerRef));

    // Focus lands in the day grid, so arrow keys drive the calendar the moment
    // it opens rather than editing the text behind it.
    this._picker()?.focus();

    this._overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      if (target && !control.contains(target)) this._close(false);
    });
  }

  private _detachPanel(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }
}
