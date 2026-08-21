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
  numberAttribute,
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
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';

export type MudTextareaVariant = 'default' | 'warning' | 'destructive' | 'success';
export type MudTextareaSize = 'medium' | 'large';
export type MudTextareaResize = 'vertical' | 'none';

let nextUniqueId = 0;

/**
 * ```html
 * <mud-textarea label="Mesaj" [formControl]="message" [maxLength]="500" [rows]="6" />
 * ```
 */
@Component({
  selector: 'mud-textarea',
  templateUrl: './mud-textarea.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudTextarea),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudTextarea implements ControlValueAccessor, FormValueControl<string> {
  /** @description Color treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudTextareaVariant>('default');

  /** @description Size rung: medium (120px min-height) or large (150px). */
  readonly size = input<MudTextareaSize>('medium');

  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Adds the red asterisk to the label and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Read-only: the field stays focusable and copyable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Forces destructive visuals and `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description `vertical` (default) or `none`; horizontal resizing is never allowed. */
  readonly resize = input<MudTextareaResize>('vertical');

  /** @description Visible text rows the control starts with. */
  readonly rows = input(4, { transform: numberAttribute });

  /** @description Current value. Two-way bindable; also driven by both forms systems. */
  readonly value = model('');

  readonly name = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);

  /** @description Shows the `n / max` character counter while `maxLength` is set. */
  readonly showCounter = input(true, { transform: booleanAttribute });

  /**
   * @description Optional screen-reader text for the counter, fully owned by the
   * consumer
   */
  readonly counterLabel = input<string | undefined>(undefined);

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

  /** @description Accessible name used when no visible `label` is set. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * @description Extra id(s) merged into the native control's aria-describedby —
   * for messages rendered OUTSIDE the field.
   */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLTextAreaElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudInputLabel);
  protected readonly _projectedHelper = contentChild(MudInputHelper);
  protected readonly _projectedError = contentChild(MudInputError);

  protected readonly _id = `mud-textarea-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _helperId = `${this._id}-helper`;
  protected readonly _errorId = `${this._id}-error`;
  protected readonly _counterId = `${this._id}-counter`;

  protected readonly _focused = signal(false);
  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: string) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid() || this.errors().length > 0);

  protected readonly _effectiveVariant = computed<MudTextareaVariant>(() =>
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

  protected readonly _showCounter = computed(() => this.showCounter() && this.maxLength() != null);

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
    const classes = ['input-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this.resize() === 'none') classes.push('input-field--no-resize');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

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

  /** Focuses the native textarea (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  // ----- internal handlers -----

  protected _onInput(event: Event): void {
    const next = (event.target as HTMLTextAreaElement).value;

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
}
