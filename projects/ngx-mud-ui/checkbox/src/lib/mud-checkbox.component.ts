import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
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
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { _MudSelectionControlStyles, MudStyleLoader } from 'ngx-mud-ui/core';

export type MudCheckboxSize = 'sm' | 'md';

let nextUniqueId = 0;

/**
 * ```html
 * <mud-checkbox [formField]="form.subscribed" required>
 *   <mud-label>Accept termenii</mud-label>
 *   @if (form.subscribed().touched() && form.subscribed().invalid()) {
 *     <mud-inline-message variant="error">Message.</mud-inline-message>
 *   }
 * </mud-checkbox>
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
  /** @description Size rung: `md` (24px box) or `sm` (20px). */
  readonly size = input<MudCheckboxSize>('md');

  /** @description Checked state. Two-way bindable; also driven by both forms systems. */
  readonly checked = model(false);

  /** @description Mixed state (the dash); consumer-owned, user toggles do not clear it. */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  /** @description Disables the checkbox. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Adds the red asterisk and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Focusable and readable, but not toggleable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Native `name` attribute. */
  readonly name = input<string>('');

  /** @description Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description External labelling element id(s); wins over `ariaLabel`. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Fires when focus leaves the checkbox; signal forms use it to mark the field touched. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-checkbox-${nextUniqueId++}`;
  protected readonly _assistiveId = `${this._id}-assistive`;

  private readonly _cvaDisabled = signal(false);
  private _onChange: (checked: boolean) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._hasMessages()) ids.push(this._assistiveId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this.ariaLabelledby()) return null;

    if (this._hasLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['selection-control'];

    if (this.size() === 'sm') classes.push('selection-control--sm');

    if (this.checked()) classes.push('is-checked');

    if (this.indeterminate()) classes.push('is-indeterminate');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudSelectionControlStyles);

    // Indeterminate exists only as a DOM property; mirror it so AT announces "mixed".
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
    // Native checkboxes have no readonly; blocking click (also Space) emulates it.
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
