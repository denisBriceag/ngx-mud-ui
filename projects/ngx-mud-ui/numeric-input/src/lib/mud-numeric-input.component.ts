import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
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
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';

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
 * <mud-numeric-input label="Suma" [min]="0" [max]="10000" [precision]="2"
 *                    locale="ro-MD" showSteppers [formControl]="amount">
 *   <span suffix>MDL</span>
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

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
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

  /**
   * @description BCP 47 locale for display formatting and lenient parsing of grouped
   * input (e.g. ro-MD renders 1250.5 as "1.250,5"). Unset = plain digits with
   * a dot decimal separator.
   */
  readonly locale = input<string | undefined>(undefined);

  /** @description Shows a trailing clear (×) while the field holds a value. */
  readonly clearable = input(false, { transform: booleanAttribute });

  readonly name = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);

  /** @description Shows the `n / max` character counter while `maxLength` is set. */
  readonly showCounter = input(true, { transform: booleanAttribute });

  /** @description Optional consumer-owned screen-reader sentence for the counter. */
  readonly counterLabel = input<string | undefined>(undefined);

  /**
   * @description Validation errors pushed by signal forms; the first message renders as
   * the error line unless `errorText` overrides it.
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /** @description Plain-text label above the field. */
  readonly label = input<string | undefined>(undefined);

  /** @description Helper/hint below the field. Replaced by the error message when invalid. */
  readonly helperText = input<string | undefined>(undefined);

  /** @description Error message shown below the field when invalid. */
  readonly errorText = input<string | undefined>(undefined);

  /** @description Accessible label of the increment stepper. Localize per app. */
  readonly incrementLabel = input('Increase');

  /** @description Accessible label of the decrement stepper. Localize per app. */
  readonly decrementLabel = input('Decrease');

  /** @description Accessible label of the clear button. Localize per app. */
  readonly clearLabel = input('Clear');

  /** @description Accessible name used when no visible `label` is set. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Human-friendly value announcement (native aria-valuetext). */
  readonly ariaValuetext = input<string | undefined>(undefined);

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Fired when a stepper or arrow key changes the value. */
  readonly stepped = output<MudNumericInputStep>();

  /** Fired when typed input is rejected or clamped at parse/commit time. */
  readonly errored = output<MudNumericInputErrorKind>();

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudInputLabel);
  protected readonly _projectedHelper = contentChild(MudInputHelper);
  protected readonly _projectedError = contentChild(MudInputError);

  protected readonly _id = `mud-numeric-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _helperId = `${this._id}-helper`;
  protected readonly _errorId = `${this._id}-error`;
  protected readonly _counterId = `${this._id}-counter`;

  protected readonly _focused = signal(false);

  /** @docs-private What the user sees; lenient while typing, formatted on commit. */
  protected readonly _display = signal('');

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: number | null) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid() || this.errors().length > 0);

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

  protected readonly _errorMessage = computed<string | undefined>(() => {
    if (!this._effectiveInvalid()) return undefined;

    const explicit = this.errorText()?.trim();

    if (explicit) return explicit;

    return this.errors().find((error) => error.message)?.message ?? undefined;
  });

  protected readonly _helperMessage = computed<string | undefined>(() => {
    const helper = this.helperText()?.trim();

    return helper || undefined;
  });

  /** @docs-private The error region shows while invalid with any content to show. */
  protected readonly _showError = computed(
    () => this._effectiveInvalid() && (!!this._projectedError() || !!this._errorMessage()),
  );

  /** @docs-private The helper region yields to an active error region. */
  protected readonly _showHelper = computed(
    () => !this._showError() && (!!this._projectedHelper() || !!this._helperMessage()),
  );

  protected readonly _showLabel = computed(() => !!this._projectedLabel() || !!this.label()?.trim());

  protected readonly _showCounter = computed(() => this.showCounter() && this.maxLength() != null);

  protected readonly _showClear = computed(
    () => this.clearable() && !this._inert() && this._display().length > 0,
  );

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._showError()) ids.push(this._errorId);
    else if (this._showHelper()) ids.push(this._helperId);

    if (this._showCounter()) ids.push(this._counterId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._showLabel()) return null;

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
    // External value changes (writeValue, [(value)], signal forms) reformat
    // the display. While focused, a change that merely echoes the user's own
    // typing (model === parse(display)) must NOT reformat mid-entry; a
    // genuinely different programmatic value still wins.
    effect(() => {
      const value = this.value();

      // Untracked: the display must not re-trigger this effect (typing a
      // partial like "abc" or "1," would otherwise be clobbered instantly).
      const typedValue = untracked(() => this._parse(this._display()));

      if (untracked(this._focused) && Object.is(typedValue, value)) return;

      untracked(() => this._display.set(this._format(value)));
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
    const locale = this.locale();

    if (!locale) return { group: '', decimal: '.' };

    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);

    return {
      group: parts.find((part) => part.type === 'group')?.value ?? '',
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    };
  }

  private _parse(raw: string): number | null {
    const trimmed = raw.trim();

    if (!trimmed) return null;

    const { group, decimal } = this._separators();
    let normalized = trimmed;

    if (group) normalized = normalized.split(group).join('');

    if (decimal !== '.') normalized = normalized.split(decimal).join('.');

    const value = Number(normalized);

    return Number.isFinite(value) ? value : null;
  }

  private _format(value: number | null): string {
    if (value === null) return '';

    const locale = this.locale();
    const precision = this.precision();

    if (!locale) {
      return precision !== undefined ? value.toFixed(precision) : String(value);
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision ?? 0,
      maximumFractionDigits: precision ?? (this.allowDecimal() ? 20 : 0),
      useGrouping: true,
    }).format(value);
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
