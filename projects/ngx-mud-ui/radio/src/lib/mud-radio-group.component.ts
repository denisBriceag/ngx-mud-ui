import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MudRadio } from './mud-radio.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { _MudSelectionControlStyles, MudStyleLoader } from 'ngx-mud-ui/core';

export type MudRadioGroupSize = 'medium' | 'small';

export type MudRadioGroupOrientation = 'vertical' | 'horizontal';

let nextUniqueId = 0;

/**
 * ```html
 * <mud-radio-group [formField]="form.method" required>
 *   <mud-label>Metoda de plată</mud-label>
 *   <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
 *   <mud-radio value="mpay"><mud-label>MPay</mud-label></mud-radio>
 *   @if (form.method().touched() && form.method().invalid()) {
 *     <mud-inline-message variant="error">Message.</mud-inline-message>
 *   }
 * </mud-radio-group>
 * ```
 */
@Component({
  selector: 'mud-radio-group',
  templateUrl: './mud-radio-group.component.html',
  host: {
    class: 'radio-group',
    '[class.radio-group--horizontal]': "orientation() === 'horizontal'",
    '[class.radio-group--disabled]': '_effectiveDisabled()',
    role: 'radiogroup',
    '[attr.aria-labelledby]': '_ariaLabelledby()',
    '[attr.aria-label]': '_ariaLabel()',
    '[attr.aria-describedby]': '_describedBy()',
    '[attr.aria-required]': "required() ? 'true' : null",
    '[attr.aria-invalid]': "_effectiveInvalid() ? 'true' : null",
    '(focusout)': '_onFocusout($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudRadioGroup),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudRadioGroup<T = unknown> implements ControlValueAccessor, FormValueControl<T | undefined> {
  /** @description Selected value. Two-way bindable; also driven by both forms systems. */
  readonly value = model<T | undefined>(undefined);

  /** @description Shared native name of the children. Auto-generated when unset. */
  readonly name = input<string>('');

  /** @description Size rung applied to every child radio. */
  readonly size = input<MudRadioGroupSize>('medium');

  /** @description Stacks the options (default) or lays them in a wrapping row. */
  readonly orientation = input<MudRadioGroupOrientation>('vertical');

  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Marks the group mandatory (asterisk + native required on the children). */
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Children stay focusable but the selection cannot change. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals on every child + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description External labelling element id(s); wins over the visible label. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** @description Extra id(s) merged into the group's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Signal-forms touch contract: emitted when focus leaves the group. */
  readonly touch = output<void>();

  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly _radios = contentChildren(forwardRef(() => MudRadio));

  /** @docs-private descendants:false so a child mud-radio's own label isn't picked up. */
  protected readonly _label = contentChild(MudLabel, { descendants: false });

  /** @docs-private descendants:false, same reason as `_label`. */
  private readonly _messages = contentChildren(MudInlineMessage, { descendants: false });

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  private readonly _uid = `mud-radio-group-${nextUniqueId++}`;
  protected readonly _labelId = `${this._uid}-label`;
  protected readonly _assistiveId = `${this._uid}-assistive`;

  /** @docs-private The native name shared by the children. */
  readonly _name = computed(() => this.name() || this._uid);

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: T | undefined) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  /** @docs-private */
  readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _ariaLabelledby = computed<string | null>(() => {
    const external = this.ariaLabelledby();

    if (external) return external;

    return this._hasLabel() ? this._labelId : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._ariaLabelledby()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this._hasMessages()) ids.push(this._assistiveId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  // ----- ControlValueAccessor (reactive/template-driven forms) -----

  constructor() {
    inject(MudStyleLoader).load(_MudSelectionControlStyles);
  }

  writeValue(value: T | undefined): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | undefined) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  /** @description Focuses the selected option, or the first enabled one. */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    const radios = this._radios() as readonly MudRadio<T>[];
    const target =
      radios.find((radio) => Object.is(radio.value(), this.value()) && !radio.disabled()) ??
      radios.find((radio) => !radio.disabled());

    target?._focus(options);
  }

  // ----- internal API for MudRadio -----

  /** @docs-private Called by a child radio when the user selects it. */
  _select(value: T): void {
    this.value.set(value);
    this._onChange(value);
  }

  /** @docs-private */
  protected _onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;

    if (next && this._host.contains(next)) return;

    this._onTouched();
    this.touch.emit();
  }
}
