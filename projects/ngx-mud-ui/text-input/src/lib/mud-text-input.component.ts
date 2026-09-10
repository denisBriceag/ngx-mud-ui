import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MudFieldError, MudFieldHelper, MudFieldLabel } from './mud-field-slots';

export type MudTextInputVariant = 'default' | 'warning' | 'destructive' | 'success';
export type MudTextInputSize = 'medium' | 'large';
export type MudTextInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';

let nextUniqueId = 0;

function toRegExpArray(value: unknown): readonly RegExp[] {
  if (value == null || value === '') return [];

  if (typeof value === 'string') return [new RegExp(value)];

  if (value instanceof RegExp) return [value];

  if (Array.isArray(value)) return value.filter((item): item is RegExp => item instanceof RegExp);

  return [];
}

/**
 * ```html
 * <mud-text-input label="IDNP" required [formControl]="idnp" [maxLength]="13" />
 * <mud-text-input label="Email" type="email" [formField]="form.email" />
 * <mud-text-input [invalid]="ctrl.invalid">
 *   <span mudLabel>IDNP</span>
 *   <mud-inline-message mudError variant="error">IDNP invalid — <a href="/ajutor">format</a></mud-inline-message>
 * </mud-text-input>
 * ```
 */
@Component({
  selector: 'mud-text-input',
  templateUrl: './mud-text-input.component.html',
  host: {
    '[class]': '_hostClasses()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudTextInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudTextInput implements ControlValueAccessor, FormValueControl<string> {
  /** @description Color treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudTextInputVariant>('default');

  /** @description Visual size rung: medium (40px, 14/20) or large (48px, 16/24). */
  readonly size = input<MudTextInputSize>('medium');

  /** @description Native input `type`. */
  readonly type = input<MudTextInputType>('text');

  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Adds the red asterisk to the label and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Read-only: the field stays focusable and copyable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * @description Forces destructive visuals and `aria-invalid`. Pair with `errorText`
   * to surface the message. Signal forms bind this automatically.
   */
  readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * @description Loading: the control becomes uninteractive and a trailing spinner
   * replaces the end icon; the host carries `aria-busy`.
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * @description Shows a trailing clear (×) button while the field holds a value.
   * Clearing empties the field and returns focus to it. Suppressed when
   * disabled, read-only, or loading.
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @description Current value. Two-way bindable; also driven by both forms systems. */
  readonly value = model('');

  readonly name = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);
  readonly inputMode = input<string | undefined>(undefined);
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);

  /** @description Accepts a string/RegExp (native semantics) or the RegExp[] signal forms push. */
  readonly pattern = input([] as readonly RegExp[], { transform: toRegExpArray });

  /** @docs-private First pattern as the native attribute (it holds a single regex). */
  protected readonly _patternAttr = computed(() => this.pattern()[0]?.source ?? null);

  /**
   * @description Validation errors pushed by signal forms. When present the field turns
   * destructive and the first error's message renders as the error line
   * (unless `errorText` overrides it).
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /** @description Plain-text label above the field. */
  readonly label = input<string | undefined>(undefined);

  /** @description Helper/hint below the field. Replaced by the error message when invalid. */
  readonly helperText = input<string | undefined>(undefined);

  /** @description Error message shown below the field when invalid. */
  readonly errorText = input<string | undefined>(undefined);

  /** @description Accessible label for the clear button. Localize per app. */
  readonly clearLabel = input('Clear field');

  /** @description Accessible name used when no visible `label` is set. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * @description Extra id(s) merged into the native control's aria-describedby —
   * for messages rendered OUTSIDE the field (suppress the built-in ones by
   * leaving helperText/errorText unset and not projecting mud-helper/mud-error).
   */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudFieldLabel);
  protected readonly _projectedHelper = contentChild(MudFieldHelper);
  protected readonly _projectedError = contentChild(MudFieldError);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly _id = `mud-text-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _helperId = `${this._id}-helper`;
  protected readonly _errorId = `${this._id}-error`;

  protected readonly _focused = signal(false);
  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: string) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid() || this.errors().length > 0);

  protected readonly _effectiveVariant = computed<MudTextInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  protected readonly _errorMessage = computed<string | undefined>(() => {
    if (!this._effectiveInvalid()) return undefined;

    const explicit = this.errorText()?.trim();

    if (explicit) return explicit;

    const fromErrors = this.errors().find((error) => error.message)?.message;

    return fromErrors ?? undefined;
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

  protected readonly _showClear = computed(
    () =>
      this.clearable() &&
      !this._effectiveDisabled() &&
      !this.readonly() &&
      !this.loading() &&
      this.value().length > 0,
  );

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._showError()) ids.push(this._errorId);
    else if (this._showHelper()) ids.push(this._helperId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._showLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this.loading()) classes.push('is-loading');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  // ----- ControlValueAccessor (reactive/template-driven forms) -----

  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  // ----- FormValueControl extras -----

  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  protected _onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;

    this.value.set(next);
    this._onChange(next);
  }

  protected _onFocus(): void {
    this._focused.set(true);
  }

  protected _onBlur(): void {
    this._focused.set(false);
    this._onTouched();
    this.touch.emit();
  }

  protected _onClear(): void {
    if (this._effectiveDisabled() || this.readonly() || this.loading()) return;

    this.value.set('');
    this._onChange('');
    this.focus();
  }
}
