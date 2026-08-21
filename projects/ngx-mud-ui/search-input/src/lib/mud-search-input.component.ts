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
import { MudInputError, MudInputHelper, MudInputLabel } from 'ngx-mud-ui/input';

export type MudSearchInputVariant = 'default' | 'destructive';
export type MudSearchInputSize = 'medium' | 'large';
export type MudSearchInputShape = 'rectangular' | 'circular';

let nextUniqueId = 0;

/**
 * ```html
 * <mud-search-input shape="circular" placeholder="Caută servicii" (searched)="find($event)" />
 * ```
 */
@Component({
  selector: 'mud-search-input',
  templateUrl: './mud-search-input.component.html',
  host: {
    '[class]': '_hostClasses()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudSearchInput),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudSearchInput implements ControlValueAccessor, FormValueControl<string> {
  /** @description Color treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudSearchInputVariant>('default');

  /** @description Size rung: medium (40px) or large (48px). */
  readonly size = input<MudSearchInputSize>('medium');

  /** @description Silhouette: rectangular (8px radius) or circular (pill). */
  readonly shape = input<MudSearchInputShape>('rectangular');

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Read-only: the field stays focusable and copyable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Forces destructive visuals and `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Shows the clear (×) affordance while the field holds a value. ON by default. */
  readonly clearable = input(true, { transform: booleanAttribute });

  /** @description Loading: the control becomes uninteractive and a trailing spinner shows. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @description Renders the integrated brand submit button on the trailing edge. */
  readonly withButton = input(false, { transform: booleanAttribute });

  /** @description Accessible label of the submit button. Localize per app. */
  readonly submitLabel = input('Search');

  /** @description Accessible label of the clear affordance. Localize per app. */
  readonly clearLabel = input('Clear');

  /** @description Current value. Two-way bindable; also driven by both forms systems. */
  readonly value = model('');

  readonly name = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);

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

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Fired on Enter or the submit button, with the current query. */
  readonly searched = output<string>();

  /** Fired after the clear affordance empties the field. */
  readonly cleared = output<void>();

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudInputLabel);
  protected readonly _projectedHelper = contentChild(MudInputHelper);
  protected readonly _projectedError = contentChild(MudInputError);

  protected readonly _id = `mud-search-input-${nextUniqueId++}`;
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

  protected readonly _effectiveVariant = computed<MudSearchInputVariant>(() =>
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

  protected readonly _inert = computed(
    () => this._effectiveDisabled() || this.readonly() || this.loading(),
  );

  protected readonly _showClear = computed(
    () => this.clearable() && !this._inert() && this.value().length > 0,
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

    if (this.shape() === 'circular') classes.push('input-field--circular');

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

  /** Focuses the native input (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  // ----- internal handlers -----

  protected _onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;

    this.value.set(next);
    this._onChange(next);
  }

  protected _onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || this._inert()) return;

    event.preventDefault();
    this.searched.emit(this.value());
  }

  protected _onSubmitClick(): void {
    if (this._inert()) return;

    this.searched.emit(this.value());
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
    if (this._inert()) return;

    this.value.set('');
    this._onChange('');
    this.cleared.emit();
    this.focus();
  }
}
