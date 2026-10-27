import {
  afterNextRender,
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
  Injector,
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
import type { ElementRef, TemplateRef } from '@angular/core';
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
import {
  isSelectable,
  isValidTime,
  MUD_TIME_PATTERN,
  minuteStepTransform,
  toValidTimeOrUndefined,
} from './time-core';
import type { MudMinuteStep, MudTimeValue } from './time-core';
import {
  caretForDigitIndex,
  digitsBefore,
  displayToTime,
  formatMasked,
  padHourOnSeparator,
} from './time-mask';
import { MudTimePicker } from './mud-time-picker.component';
import { _MudInputFieldStyles, MudStyleLoader } from 'ngx-mud-ui/core';
import { injectMudLabels } from 'ngx-mud-ui/i18n';

declare const ngDevMode: boolean | undefined;

export type MudTimeInputSize = 'medium' | 'large';
export type MudTimeInputVariant = 'default' | 'warning' | 'destructive' | 'success';

let nextUniqueId = 0;

/** A placeholder doubles as the ghost pattern, so it must mirror `HH:MM`: digits would blend into typed input. */
const PLACEHOLDER_SHAPE = /^[^\d:]{2}:[^\d:]{2}$/;

/**
 * ```html
 * <mud-time-input [formField]="form.start" required>
 *   <mud-label>Ora de început</mud-label>
 *   @if (form.start().touched() && form.start().invalid()) {
 *     <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
 *   }
 * </mud-time-input>
 * ```
 */
@Component({
  selector: 'mud-time-input',
  templateUrl: './mud-time-input.component.html',
  styleUrl: './mud-time-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [MudTimePicker, CdkTrapFocus],
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudTimeInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudTimeInput implements ControlValueAccessor, FormValueControl<MudTimeValue> {
  /** @description `HH:MM` (24-hour) or `null`. Two-way bindable; driven by both forms systems. */
  readonly value = model<MudTimeValue>(null);

  /** @description Whether the picker popover is open. Two-way bindable. */
  readonly open = model(false);

  /** @description Trailing clear (×) button, shown only while the field holds text. */
  readonly clearable = input(false, { transform: booleanAttribute });

  readonly variant = input<MudTimeInputVariant>('default');
  readonly size = input<MudTimeInputSize>('medium');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly name = input<string>('');

  /** @description Format pattern shown while empty and as the typing ghost: two non-digits, `:`, two non-digits (e.g. `OO:MM`). Defaults to `HH:MM`. */
  readonly placeholder = input<string | undefined>(undefined);

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Earliest accepted time, `HH:MM` inclusive. Forwarded to the picker. */
  readonly min = input<string | undefined>(undefined);

  /** @description Latest accepted time, `HH:MM` inclusive. Forwarded to the picker. */
  readonly max = input<string | undefined>(undefined);

  /** @description Minute granularity: only these minutes are rendered and accepted. */
  readonly minuteStep = input<MudMinuteStep, unknown>(1, { transform: minuteStepTransform('mud-time-input') });

  /** @description Return `true` for a SELECTABLE time. Runs after min/max and minuteStep. */
  readonly timeFilter = input<((time: string) => boolean) | undefined>(undefined);

  readonly cleared = output<void>();
  readonly touch = output<void>();

  private readonly _allLabels = injectMudLabels();
  protected readonly _labels = computed(() => this._allLabels().timePicker);

  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _injector = inject(Injector);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _control = viewChild.required<ElementRef<HTMLElement>>('control');
  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly _picker = viewChild(MudTimePicker);

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());
  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-time-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;
  protected readonly _hintId = `${this._id}-hint`;
  protected readonly _dialogId = `${this._id}-dialog`;
  protected readonly _pattern = computed(() => {
    const custom = this.placeholder()?.trim();

    return custom && PLACEHOLDER_SHAPE.test(custom) ? custom : MUD_TIME_PATTERN;
  });

  protected readonly _focused = signal(false);
  private _overlayRef: OverlayRef | null = null;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: MudTimeValue) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  protected readonly _valueTime = computed<string | null>(() => {
    const value = this.value();

    return isValidTime(value) ? value : null;
  });

  protected readonly _minTime = computed(() => toValidTimeOrUndefined(this.min()));
  protected readonly _maxTime = computed(() => toValidTimeOrUndefined(this.max()));

  protected readonly _draft = linkedSignal<string, string>({
    source: () => this._valueTime() ?? '',
    computation: (display, previous) =>
      previous && previous.source === display ? previous.value : display,
  });

  protected readonly _ghost = computed(() => this._pattern().slice(this._draft().length));

  private _lastValue: string | null = null;

  /** What this component last emitted; a `value` that differs arrived from outside. */
  private _lastEmitted: MudTimeValue = null;

  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());
  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _effectiveVariant = computed<MudTimeInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  protected readonly _showClear = computed(
    () =>
      this.clearable() &&
      !this._effectiveDisabled() &&
      !this.readonly() &&
      this._draft().length > 0,
  );

  protected readonly _formatHint = computed(() => this._labels().formatHint(this._pattern()));

  protected readonly _describedBy = computed<string>(() => {
    const ids = [this._hintId];

    if (this._hasMessages()) ids.push(this._assistiveId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.join(' ');
  });

  protected readonly _ariaLabel = computed<string | null>(() =>
    this._hasLabel() ? null : (this.ariaLabel() ?? null),
  );

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', 'time-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this.open()) classes.push('is-open');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if ((this._focused() || this.open()) && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudInputFieldStyles);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        const placeholder = this.placeholder()?.trim();

        if (!placeholder || PLACEHOLDER_SHAPE.test(placeholder)) return;

        console.warn(
          `[mud-time-input] placeholder ${JSON.stringify(placeholder)} does not have the HH:MM shape ` +
            `(two non-digits, ':', two non-digits); using 'HH:MM'.`,
        );
      });
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        const value = this.value();

        if (value === null || value === '' || isValidTime(value)) return;

        console.warn(
          `[mud-time-input] expected a 24-hour 'HH:MM' time, received ${JSON.stringify(value)}. Rendering as empty.`,
        );
      });
    }

    effect(() => {
      const display = this._draft();

      if (!this._isBrowser) return;

      const native = this._native().nativeElement;

      if (native.value !== display) native.value = display;
    });

    effect(() => {
      if (this.value() !== this._lastEmitted) this._lastValue = null;
    });

    effect(() => {
      if (!this._isBrowser) return;

      if (this.open() && (this._effectiveDisabled() || this.readonly())) {
        this.open.set(false);

        return;
      }

      if (this.open()) this._attachPanel();
      else this._detachPanel();
    });

    inject(DestroyRef).onDestroy(() => this._detachPanel());
  }

  // ----- ControlValueAccessor -----

  writeValue(value: MudTimeValue): void {
    this._lastValue = null;
    this.value.set(value);
  }

  registerOnChange(fn: (value: MudTimeValue) => void): void {
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

    this._native().nativeElement.focus(options);
  }

  // ----- typing -----

  private _maskAndRestoreCaret(native: HTMLInputElement): string {
    const raw = native.value;
    const caret = native.selectionStart ?? raw.length;
    const masked = formatMasked(raw);

    if (masked !== raw) {
      const offset =
        caret >= raw.length ? masked.length : caretForDigitIndex(masked, digitsBefore(raw, caret));

      native.value = masked;
      native.setSelectionRange?.(offset, offset);
    }

    return masked;
  }

  private _rememberUsable(): void {
    const time = this._valueTime();

    if (time) this._lastValue = time;
  }

  protected _onInput(event: Event): void {
    this._rememberUsable();

    const masked = this._maskAndRestoreCaret(event.target as HTMLInputElement);

    if (masked === '') this._lastValue = null;

    this._commitFrom(masked);
    this._draft.set(masked);
  }

  private _commitFrom(display: string): void {
    this._emit(this._usableTime(display));
  }

  private _usableTime(display: string): string | null {
    const time = displayToTime(display);

    if (!time) return null;

    const constraints = {
      min: this._minTime(),
      max: this._maxTime(),
      minuteStep: this.minuteStep(),
      timeFilter: this.timeFilter(),
    };

    return isSelectable(time, constraints) ? time : null;
  }

  private _emit(value: MudTimeValue): void {
    this._lastEmitted = value;
    this.value.set(value);
    this._onChange(value);
  }

  protected _onFocus(): void {
    this._focused.set(true);
  }

  protected _onBlur(): void {
    this._focused.set(false);
    this._settleOnBlur();
    this._onTouched();
    this.touch.emit();
  }

  private _settleOnBlur(): void {
    const display = this._draft();

    if (display === (this._valueTime() ?? '')) return;

    const settled = display ? (this._usableTime(display) ?? this._lastValue) : null;

    if (settled !== this._valueTime()) this._emit(settled);

    if (this._draft() !== (settled ?? '')) this._draft.set(settled ?? '');
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

      return;
    }

    const native = event.target as HTMLInputElement;
    const padded = padHourOnSeparator(native.value, event.key);

    if (padded === null) return;

    event.preventDefault();
    this._rememberUsable();
    native.value = padded;
    native.setSelectionRange?.(padded.length, padded.length);
    this._commitFrom(padded);
    this._draft.set(padded);
  }

  protected _onClear(): void {
    this._lastValue = null;
    this._draft.set('');
    this._emit(null);
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

  protected _onPickerChange(value: MudTimeValue): void {
    this._emit(value);
    this._close();
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

    afterNextRender(() => this._picker()?.focus(), { injector: this._injector });

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
