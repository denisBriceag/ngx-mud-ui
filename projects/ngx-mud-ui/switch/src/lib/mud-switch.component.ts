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
import type { FormCheckboxControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { _MudSelectionControlStyles, MudStyleLoader } from 'ngx-mud-ui/core';

let nextUniqueId = 0;

/**
 * ```html
 * <mud-switch [formControl]="notifications">
 *   <mud-label>Notificări prin e-mail</mud-label>
 * </mud-switch>
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

  /** @description Disables the switch. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Adds the native `required` attribute (the switch must be on). */
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Native `name` attribute. */
  readonly name = input<string>('');

  /** @description Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description External labelling element id(s); wins over `ariaLabel`. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** @description Id(s) of external descriptive text for the native control. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Fires when focus leaves the field; signal forms use it to mark the field touched. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  protected readonly _id = `mud-switch-${nextUniqueId++}`;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (checked: boolean) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this.ariaLabelledby()) return null;

    if (this._hasLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['switch-control'];

    if (this.checked()) classes.push('is-checked');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    return classes.join(' ');
  });

  // ----- ControlValueAccessor (reactive/template-driven forms) -----

  constructor() {
    inject(MudStyleLoader).load(_MudSelectionControlStyles);
  }

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
