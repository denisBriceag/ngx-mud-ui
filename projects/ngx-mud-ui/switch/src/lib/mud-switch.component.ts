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
import type { FormCheckboxControl, ValidationError } from '@angular/forms/signals';
import { MudInputLabel } from 'ngx-mud-ui/input';

let nextUniqueId = 0;

/**
 * Switch — an instant on/off toggle. A native
 * `<input type="checkbox" role="switch">` (the official a11y pattern) drives
 * a styled track + thumb; the label toggles on click.
 *
 * Works with BOTH forms systems:
 * - Signal forms via the FormCheckboxControl contract
 *   (`<mud-switch [formField]="form.notifications" />` binds `checked`).
 * - Reactive/template-driven forms via ControlValueAccessor (boolean value).
 * - Standalone via the two-way `[(checked)]` model.
 *
 * Deliberately minimal like the official switch: one size, no invalid /
 * readonly / supporting-text states. Associate an external message via
 * `aria-describedby` when needed.
 *
 * ```html
 * <mud-switch label="Notificări prin e-mail" [formControl]="notifications" />
 * ```
 */
@Component({
  selector: 'mud-switch',
  templateUrl: './mud-switch.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudSwitch),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudSwitch implements ControlValueAccessor, FormCheckboxControl {
  /** @description On/off state. Two-way bindable; also driven by both forms systems. */
  readonly checked = model(false);

  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Adds the native `required` attribute (the switch must be on). */
  readonly required = input(false, { transform: booleanAttribute });

  readonly name = input<string>('');

  /**
   * @description Validation errors pushed by signal forms (no visual region on the
   * minimal switch; combine with an external message if needed).
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /** @description Plain-text label beside the track ([mudLabel] slot for rich content). */
  readonly label = input<string | undefined>(undefined);

  /** @description Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description External labelling element id(s); wins over `ariaLabel`. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** @description Id(s) of external descriptive text for the native control. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Signal-forms touch contract: emitted when focus leaves the control. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected label marker ([mudLabel]). */
  protected readonly _projectedLabel = contentChild(MudInputLabel);

  protected readonly _id = `mud-switch-${nextUniqueId++}`;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (checked: boolean) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _showLabel = computed(() => !!this._projectedLabel() || !!this.label()?.trim());

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this.ariaLabelledby()) return null;

    if (this._showLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['switch-control'];

    if (this.checked()) classes.push('is-checked');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    return classes.join(' ');
  });

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

  /** Focuses the native control (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  // ----- internal handlers -----

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
