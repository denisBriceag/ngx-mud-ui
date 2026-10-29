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
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';
import { _MudInputFieldStyles, MudStyleLoader } from 'ngx-mud-ui/core';

export type MudTextInputVariant = 'default' | 'warning' | 'destructive' | 'success';
export type MudTextInputSize = 'md' | 'lg';
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
 * <mud-text-input [formField]="form.idnp" required>
 *   <mud-label>IDNP</mud-label>
 *   @if (form.idnp().touched() && form.idnp().invalid()) {
 *     <mud-inline-message variant="error">IDNP invalid.</mud-inline-message>
 *   }
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

  /** @description Visual size rung: `md` (40px, 14/20) or `lg` (48px, 16/24). */
  readonly size = input<MudTextInputSize>('md');

  /** @description Native input `type`. */
  readonly type = input<MudTextInputType>('text');

  /** @description Disables the field. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Adds the red asterisk to the label and the native `required` attribute. */
  readonly required = input(false, { transform: booleanAttribute });

  /** @description Read-only: the field stays focusable and copyable. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Loading: uninteractive with a trailing spinner; the host carries `aria-busy`. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @description Shows a trailing clear (×) button while the field holds a value. */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @description Current value. Two-way bindable; also driven by both forms systems. */
  readonly value = model('');

  /** @description Native `name` attribute. */
  readonly name = input<string>('');
  /** @description Native `placeholder`. Don't use it in place of a label. */
  readonly placeholder = input<string | undefined>(undefined);
  /** @description Native `autocomplete`, such as `email` or `tel`. */
  readonly autocomplete = input<string | undefined>(undefined);
  /** @description Native `inputmode`: which on-screen keyboard to show, such as `numeric`. */
  readonly inputMode = input<string | undefined>(undefined);
  /** @description Native `minlength`. */
  readonly minLength = input<number | undefined>(undefined);
  /** @description Native `maxlength`. */
  readonly maxLength = input<number | undefined>(undefined);

  /** @description Accepts a string/RegExp (native semantics) or the RegExp[] signal forms push. */
  readonly pattern = input([] as readonly RegExp[], { transform: toRegExpArray });

  /** @docs-private First pattern as the native attribute (it holds a single regex). */
  protected readonly _patternAttr = computed(() => this.pattern()[0]?.source ?? null);

  /** @description Accessible label for the clear button. Unset or blank follows the app labels (`textInput.clear`). */
  readonly clearLabel = input<string | undefined>(undefined);

  private readonly _labels = injectMudLabels();

  protected readonly _clearLabel = computed(() => _mudText(this.clearLabel(), this._labels().textInput.clear));

  /** @description Accessible name used when no `mud-label` is projected. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Fires when focus leaves the field; signal forms use it to mark the field touched. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly _id = `mud-text-input-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;

  protected readonly _focused = signal(false);
  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: string) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _effectiveVariant = computed<MudTextInputVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

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

    if (this._hasMessages()) ids.push(this._assistiveId);

    const external = this.ariaDescribedby()?.trim();

    if (external) ids.push(external);

    return ids.length > 0 ? ids.join(' ') : null;
  });

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._hasLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['input-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'lg') classes.push('input-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this.loading()) classes.push('is-loading');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  // ----- ControlValueAccessor (reactive/template-driven forms) -----

  constructor() {
    inject(MudStyleLoader).load(_MudInputFieldStyles);

    // Writes only on a real change: Chrome moves the caret to the end even when the value is unchanged.
    effect(() => {
      const value = this.value();
      const native = this._native().nativeElement;

      if (native.value !== value) native.value = value;
    });
  }

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
