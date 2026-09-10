import {
  afterRenderEffect,
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
import type { FormCheckboxControl, ValidationError } from '@angular/forms/signals';
import { MudFieldError, MudFieldHelper, MudFieldLabel } from 'ngx-mud-ui/text-input';

export type MudCheckboxSize = 'medium' | 'small';

let nextUniqueId = 0;

/**
 * ```html
 * <mud-checkbox label="Accept termenii" [formControl]="terms" required />
 * ```
 */
@Component({
  selector: 'mud-checkbox',
  templateUrl: './mud-checkbox.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudCheckbox),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudCheckbox implements ControlValueAccessor, FormCheckboxControl {
  /** @description Size rung: medium (24px box) or small (20px). */
  readonly size = input<MudCheckboxSize>('medium');

  /** @description Checked state. Two-way bindable; also driven by both forms systems. */
  readonly checked = model(false);

  /**
   * @description Mixed state (the dash). Consumer-owned: rendering follows this input
   * only, and user toggles do not clear it — update it yourself on change.
   * Exposed to assistive tech via the native indeterminate property.
   */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Adds the red asterisk and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Focusable and readable, but not toggleable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  readonly name = input<string>('');

  /**
   * @description Validation errors pushed by signal forms; the first message renders as
   * the error line unless `errorText` overrides it.
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /** @description Plain-text label beside the box. */
  readonly label = input<string | undefined>(undefined);

  /** @description Secondary line under the label. Replaced by the error message when invalid. */
  readonly supportingText = input<string | undefined>(undefined);

  /** @description Error message shown when invalid. */
  readonly errorText = input<string | undefined>(undefined);

  /** @description Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description External labelling element id(s); wins over `ariaLabel`. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudFieldLabel);
  protected readonly _projectedHelper = contentChild(MudFieldHelper);
  protected readonly _projectedError = contentChild(MudFieldError);

  protected readonly _id = `mud-checkbox-${nextUniqueId++}`;
  protected readonly _supportingId = `${this._id}-supporting`;
  protected readonly _errorId = `${this._id}-error`;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (checked: boolean) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid() || this.errors().length > 0);

  protected readonly _errorMessage = computed<string | undefined>(() => {
    if (!this._effectiveInvalid()) return undefined;

    const explicit = this.errorText()?.trim();

    if (explicit) return explicit;

    return this.errors().find((error) => error.message)?.message ?? undefined;
  });

  protected readonly _supportingMessage = computed<string | undefined>(() => {
    const supporting = this.supportingText()?.trim();

    return supporting || undefined;
  });

  /** @docs-private The error region shows while invalid with any content to show. */
  protected readonly _showError = computed(
    () => this._effectiveInvalid() && (!!this._projectedError() || !!this._errorMessage()),
  );

  /** @docs-private The supporting region yields to an active error region. */
  protected readonly _showSupporting = computed(
    () => !this._showError() && (!!this._projectedHelper() || !!this._supportingMessage()),
  );

  protected readonly _showLabel = computed(() => !!this._projectedLabel() || !!this.label()?.trim());

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._showError()) ids.push(this._errorId);
    else if (this._showSupporting()) ids.push(this._supportingId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this.ariaLabelledby()) return null;

    if (this._showLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['selection-control'];

    if (this.size() === 'small') classes.push('selection-control--sm');

    if (this.checked()) classes.push('is-checked');

    if (this.indeterminate()) classes.push('is-indeterminate');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    return classes.join(' ');
  });

  constructor() {
    // The mixed state only exists as a DOM property; mirror the input onto
    // the native control so assistive tech announces "mixed".
    afterRenderEffect(() => {
      this._native().nativeElement.indeterminate = this.indeterminate();
    });
  }

  // ----- ControlValueAccessor (reactive/template-driven forms) -----

  writeValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (checked: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  // ----- FormCheckboxControl extras -----

  /** Focuses the native checkbox (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  // ----- internal handlers -----

  protected _onClick(event: MouseEvent): void {
    // A native checkbox has no readonly; blocking click (which also carries
    // keyboard Space activation) emulates it while keeping focusability.
    if (this.readonly()) event.preventDefault();
  }

  protected _onNativeChange(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;

    this.checked.set(next);
    this._onChange(next);
  }

  protected _onBlur(): void {
    this._onTouched();
    this.touch.emit();
  }
}
