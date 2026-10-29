import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { injectMudFormatLocale, injectMudLabels, _mudText, _safeLocale } from 'ngx-mud-ui/i18n';
import { _MudInputFieldStyles, MudStyleLoader } from 'ngx-mud-ui/core';

export type MudNumericInputVariant = 'default' | 'warning' | 'destructive' | 'success';
export type MudNumericInputSize = 'medium' | 'large';
export type MudNumericInputErrorKind = 'not-a-number' | 'out-of-range';

export interface MudNumericInputStep {
  value: number;
  direction: 1 | -1;
}

let nextUniqueId = 0;

/**
 * ```html
 * <mud-numeric-input [formField]="form.amount" required>
 *   <mud-label>Suma</mud-label>
 *   <span suffix>MDL</span>
 *   @if (form.amount().touched() && form.amount().invalid()) {
 *     <mud-inline-message variant="error">Suma este obligatorie.</mud-inline-message>
 *   }
 * </mud-numeric-input>
 * ```
 */
@Component({
  selector: 'mud-numeric-input',
  templateUrl: './mud-numeric-input.component.html',
  host: {
    '[class]': '_hostClasses()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudNumericInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudNumericInput implements ControlValueAccessor, FormValueControl<number | null> {
  /** @description Color treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudNumericInputVariant>('default');

  /** @description Size rung: medium (40px) or large (48px). */
  readonly size = input<MudNumericInputSize>('medium');

  /** @description Disables the field. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Adds the red asterisk to the label and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });
  /** @description Read-only: the field stays focusable and copyable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Loading: uninteractive with a trailing spinner (replaces steppers/clear). */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @description Current value (null while empty). Two-way bindable; driven by both forms systems. */
  readonly value = model<number | null>(null);

  /** @description Lower bound; commits clamp to it, steppers stop at it. Signal forms bind it. */
  readonly min = input<number | undefined>(undefined);

  /** @description Upper bound; commits clamp to it, steppers stop at it. Signal forms bind it. */
  readonly max = input<number | undefined>(undefined);

  /** @description Stepper / arrow-key increment. */
  readonly step = input(1, { transform: numberAttribute });

  /** @description Fraction digits commits are rounded (and formatted) to. */
  readonly precision = input<number | undefined>(undefined);

  /** @description Shows the trailing +/- stepper pair. */
  readonly showSteppers = input(false, { transform: booleanAttribute });

  /** @description When false, the decimal separator is blocked and commits truncate fractions. */
  readonly allowDecimal = input(true, { transform: booleanAttribute });

  /** @description When false, the minus sign is blocked and negative commits clamp up. */
  readonly allowNegative = input(true, { transform: booleanAttribute });

  /** @description BCP 47 locale for grouped formatting/parsing; unset = ungrouped, format-locale decimal. */
  readonly locale = input<string | undefined>(undefined);

  /** @description Shows a trailing clear (×) while the field holds a value. */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @description Native `name` attribute. */
  readonly name = input<string>('');
  /** @description Native `placeholder`. Don't use it in place of a label. */
  readonly placeholder = input<string | undefined>(undefined);
  /** @description Maximum number of characters; also turns on the counter. */
  readonly maxLength = input<number | undefined>(undefined);

  /** @description Shows the `n / max` character counter while `maxLength` is set. */
  readonly showCounter = input(true, { transform: booleanAttribute });

  /** @description Optional consumer-owned screen-reader sentence for the counter. */
  readonly counterLabel = input<string | undefined>(undefined);

  /** @description Accessible label of the increment stepper. Unset or blank follows the app labels (`numericInput.increment`). */
  readonly incrementLabel = input<string | undefined>(undefined);

  /** @description Accessible label of the decrement stepper. Unset or blank follows the app labels (`numericInput.decrement`). */
  readonly decrementLabel = input<string | undefined>(undefined);

  /** @description Accessible label of the clear button. Unset or blank follows the app labels (`numericInput.clear`). */
  readonly clearLabel = input<string | undefined>(undefined);

  private readonly _labels = injectMudLabels();

  private readonly _formatLocale = injectMudFormatLocale();

  protected readonly _incrementLabel = computed(() => _mudText(this.incrementLabel(), this._labels().numericInput.increment));

  protected readonly _decrementLabel = computed(() => _mudText(this.decrementLabel(), this._labels().numericInput.decrement));

  protected readonly _clearLabel = computed(() => _mudText(this.clearLabel(), this._labels().numericInput.clear));

  private readonly _numberLocale = computed(() => _safeLocale(this.locale(), this._formatLocale()));

  /** Counter digits follow the locale, never grouped (an unconfigured app keeps "1234"). */
  private readonly _counterFormat = computed(() => new Intl.NumberFormat(this._numberLocale(), { useGrouping: false }));

  /** The locale's native digits paired with their ASCII twins, empty when they already are ASCII. */
  private readonly _nativeDigits = computed(() => {
    const format = this._counterFormat();

    return Array.from({ length: 10 }, (_, digit) => [format.format(digit), String(digit)] as const).filter(([native, ascii]) => native !== ascii);
  });

  protected _formatCount(value: number): string {
    return this._counterFormat().format(value);
  }

  /** @description Accessible name used when no `mud-label` is projected. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Human-friendly value announcement (native aria-valuetext). */
  readonly ariaValuetext = input<string | undefined>(undefined);

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Fires when a stepper or an arrow key changes the value. */
  readonly stepped = output<MudNumericInputStep>();

  /** @description Fires when typed input is rejected or clamped on commit. */
  readonly errored = output<MudNumericInputErrorKind>();

  /** @description Fires when focus leaves the field; signal forms use it to mark the field touched. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-numeric-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;
  protected readonly _counterId = `${this._id}-counter`;

  protected readonly _focused = signal(false);

  /** @docs-private What the user sees; lenient while typing, formatted on commit. */
  protected readonly _display = signal('');

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: number | null) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _effectiveVariant = computed<MudNumericInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  protected readonly _inert = computed(
    () => this._effectiveDisabled() || this.readonly() || this.loading(),
  );

  protected readonly _inputMode = computed(() => (this.allowDecimal() ? 'decimal' : 'numeric'));

  protected readonly _canIncrement = computed(() => {
    if (this._inert()) return false;

    const max = this.max();

    return max === undefined || (this.value() ?? -Infinity) < max;
  });

  protected readonly _canDecrement = computed(() => {
    if (this._inert()) return false;

    const min = this.min();

    return min === undefined || (this.value() ?? Infinity) > min;
  });

  protected readonly _showCounter = computed(() => this.showCounter() && this.maxLength() != null);

  /** The counter's limit, formatted; only read while `_showCounter()` guarantees a limit. */
  protected readonly _maxLengthText = computed(() => this._formatCount(this.maxLength() ?? 0));

  protected readonly _showClear = computed(
    () => this.clearable() && !this._inert() && this._display().length > 0,
  );

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._hasMessages()) ids.push(this._assistiveId);

    if (this._showCounter()) ids.push(this._counterId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._hasLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', 'numeric-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this.loading()) classes.push('is-loading');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudInputFieldStyles);

    // External value changes reformat the display, except while focused when the
    // value merely echoes the user's own typing (model === parse(display)).
    effect(() => {
      const value = this.value();

      // Tracked so a locale switch reformats the display.
      this._numberLocale();
      this.locale();

      // Untracked, or a partial entry like "1," would be clobbered while typing.
      const typedValue = untracked(() => this._parse(this._display()));

      if (untracked(this._focused) && Object.is(typedValue, value)) return;

      untracked(() => this._display.set(this._format(value)));
    });

    // Writes only on a real change: Chrome moves the caret to the end even when the value is unchanged.
    effect(() => {
      const display = this._display();
      const native = this._native().nativeElement;

      if (native.value !== display) native.value = display;
    });
  }

  // ----- ControlValueAccessor (reactive/template-driven forms) -----

  writeValue(value: number | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  // ----- FormValueControl extras -----

  /** Focuses the native input (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  // ----- parsing / formatting -----

  private _separators(): { group: string; decimal: string } {
    const parts = new Intl.NumberFormat(this._numberLocale()).formatToParts(12345.6);

    return {
      // Only an explicit `locale` groups; otherwise grouping marks are not accepted.
      group: this.locale() ? (parts.find((part) => part.type === 'group')?.value ?? '') : '',
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    };
  }

  // Maps the locale's native digits (e.g. Arabic-Indic) to ASCII so display output parses back.
  private _toAsciiDigits(text: string): string {
    let out = text;

    for (const [native, ascii] of this._nativeDigits()) out = out.split(native).join(ascii);

    return out;
  }

  private _parse(raw: string): number | null {
    const trimmed = raw.trim();

    if (!trimmed) return null;

    const { group, decimal } = this._separators();
    let normalized = this._toAsciiDigits(trimmed);

    if (group) normalized = normalized.split(group).join('');

    if (decimal !== '.') normalized = normalized.split(decimal).join('.');

    const value = Number(normalized);

    return Number.isFinite(value) ? value : null;
  }

  private _format(value: number | null): string {
    if (value === null) return '';

    const precision = this.precision();

    // Intl prints -0 as "-0"; the field must show "0".
    return new Intl.NumberFormat(this._numberLocale(), {
      minimumFractionDigits: precision ?? 0,
      maximumFractionDigits: precision ?? (this.allowDecimal() ? 20 : 0),
      useGrouping: !!this.locale(),
    }).format(value === 0 ? 0 : value);
  }

  private _clampAndRound(value: number): number {
    let next = value;

    if (!this.allowDecimal()) next = Math.trunc(next);

    const min = this.min();
    const max = this.max();

    if (!this.allowNegative() && next < 0) next = Math.max(0, min ?? 0);

    if (min !== undefined && next < min) next = min;

    if (max !== undefined && next > max) next = max;

    const precision = this.precision();

    if (precision !== undefined) {
      const factor = 10 ** precision;

      next = Math.round(next * factor) / factor;
    }

    return next;
  }

  // ----- handlers -----

  protected _onKeydown(event: KeyboardEvent): void {
    if (this._inert()) return;

    const { decimal } = this._separators();

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this._stepBy(1);

        return;
      case 'ArrowDown':
        event.preventDefault();
        this._stepBy(-1);

        return;
      case 'Home':
        if (this.min() !== undefined) {
          event.preventDefault();
          this._setCommitted(this.min()!);
        }

        return;
      case 'End':
        if (this.max() !== undefined) {
          event.preventDefault();
          this._setCommitted(this.max()!);
        }

        return;
      case 'Enter':
        this._commit();

        return;
    }

    if (!this.allowDecimal() && (event.key === '.' || event.key === decimal)) {
      event.preventDefault();
    }

    if (!this.allowNegative() && event.key === '-') {
      event.preventDefault();
    }
  }

  protected _onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;

    this._display.set(raw);

    const parsed = this._parse(raw);

    if (raw.trim() && parsed === null) return; // partial entry ("-", "1,")

    if (parsed !== null) {
      const min = this.min();
      const max = this.max();

      if ((min !== undefined && parsed < min) || (max !== undefined && parsed > max)) {
        this.errored.emit('out-of-range');
      }
    }

    this.value.set(parsed);
    this._onChange(parsed);
  }

  /** Parses the display, clamps + rounds, updates the model, reformats. */
  protected _commit(): void {
    const raw = this._display();
    const parsed = this._parse(raw);

    if (raw.trim() && parsed === null) {
      this.errored.emit('not-a-number');
      this._display.set(this._format(this.value() === null ? null : this._clampAndRound(this.value()!)));

      return;
    }

    if (parsed === null) {
      this.value.set(null);
      this._onChange(null);
      this._display.set('');

      return;
    }

    const committed = this._clampAndRound(parsed);

    if (committed !== parsed) this.errored.emit('out-of-range');

    this._setCommitted(committed);
  }

  private _setCommitted(value: number): void {
    const committed = this._clampAndRound(value);

    this.value.set(committed);
    this._onChange(committed);
    this._display.set(this._format(committed));
  }

  protected _stepBy(direction: 1 | -1): void {
    if (direction > 0 && !this._canIncrement()) return;

    if (direction < 0 && !this._canDecrement()) return;

    const base = this.value() ?? this.min() ?? 0;
    const committed = this._clampAndRound(base + direction * this.step());

    this.value.set(committed);
    this._onChange(committed);
    this._display.set(this._format(committed));
    this.stepped.emit({ value: committed, direction });
  }

  protected _onFocus(): void {
    this._focused.set(true);
  }

  protected _onBlur(): void {
    this._focused.set(false);
    this._commit();
    this._onTouched();
    this.touch.emit();
  }

  protected _onClear(): void {
    if (this._inert()) return;

    this.value.set(null);
    this._onChange(null);
    this._display.set('');
    this.focus();
  }
}
