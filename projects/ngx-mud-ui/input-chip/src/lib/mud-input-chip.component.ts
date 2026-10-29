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
  viewChildren,
} from '@angular/core';

declare const ngDevMode: boolean | undefined;

import type { ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { _MudInputFieldStyles, MudStyleLoader } from 'ngx-mud-ui/core';
import { _mudText, injectMudLabels } from 'ngx-mud-ui/i18n';

export type MudInputChipVariant = 'default' | 'destructive';
export type MudInputChipSize = 'md' | 'lg';
export type MudInputChipErrorCode = 'pattern' | 'duplicate' | 'max';

export interface MudInputChipAdd {
  chip: string;
  chips: readonly string[];
}

export interface MudInputChipRemove {
  chip: string;
  index: number;
  chips: readonly string[];
}

export interface MudInputChipError {
  code: MudInputChipErrorCode;
  value: string;
}

let nextUniqueId = 0;

/**
 * ```html
 * <mud-input-chip [maxChips]="5" [validatePattern]="emailPattern" [formControl]="recipients">
 *   <mud-label>Destinatari</mud-label>
 *   @if (recipients.touched && recipients.invalid) {
 *     <mud-inline-message variant="error">Adăugați cel puțin o adresă.</mud-inline-message>
 *   }
 * </mud-input-chip>
 * ```
 */
@Component({
  selector: 'mud-input-chip',
  templateUrl: './mud-input-chip.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudInputChip),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudInputChip implements ControlValueAccessor, FormValueControl<string[]> {
  /** @description Color treatment. `destructive` is forced when `invalid` is set. */
  readonly variant = input<MudInputChipVariant>('default');

  /** @description Size rung: `md` (40px min-height) or `lg` (48px). */
  readonly size = input<MudInputChipSize>('md');

  /** @description Disables the field. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Adds the red asterisk to the label. */
  readonly required = input(false, { transform: booleanAttribute });
  /** @description Read-only: the chips stay readable, but none can be added or removed. */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Confirmed chips — the form value. Two-way bindable; driven by both forms systems. */
  readonly value = model<string[]>([]);

  /** @description The not-yet-confirmed text in the inline input. */
  readonly draft = model('');

  /** @description Maximum chips accepted; further additions emit `errored` with code `max`. */
  readonly maxChips = input<number | undefined>(undefined);

  /** @description Non-matching values reject with code `pattern` (not named `pattern`: signal forms bind that). */
  readonly validatePattern = input<RegExp | undefined>(undefined);

  /** @description Characters that confirm a chip in addition to Enter. Newlines always split pastes. */
  readonly separators = input(',');

  /** @description Native `name` attribute. */
  readonly name = input<string>('');

  /** @description Shown only while no chips exist. */
  readonly placeholder = input<string | undefined>(undefined);

  /** @description Builds each chip's remove-button accessible name. */
  readonly removeLabel = input<((chip: string) => string) | undefined>(undefined);

  /** @description Builds the live-region announcement for an added chip. */
  readonly announceAdded = input<((chip: string) => string) | undefined>(undefined);

  /** @description Builds the live-region announcement for a removed chip. */
  readonly announceRemoved = input<((chip: string) => string) | undefined>(undefined);

  /** @description Builds the live-region announcement for a rejected value. */
  readonly announceRejected = input<((error: MudInputChipError) => string) | undefined>(undefined);

  /** @description Accessible name used when no visible `label` is set. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** @description Fires when a chip is added. */
  readonly chipAdded = output<MudInputChipAdd>();

  /** @description Fires when a chip is removed. */
  readonly chipRemoved = output<MudInputChipRemove>();

  /** @description Fires for every rejected value, with the reason (`pattern`, `duplicate` or `max`). */
  readonly errored = output<MudInputChipError>();

  /** @description Fires when focus leaves the field; signal forms use it to mark the field touched. */
  readonly touch = output<void>();

  private readonly _labels = injectMudLabels();

  /** @docs-private Remove-button name builder, called per chip by the template. */
  protected readonly _removeName = computed(() => _mudText(this.removeLabel(), this._labels().inputChip.remove));

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _removeButtons = viewChildren<ElementRef<HTMLButtonElement>>('removeBtn');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-input-chip-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _assistiveId = `${this._id}-assistive`;

  protected readonly _focused = signal(false);

  /** @docs-private role=status live text announcing add / remove / reject. */
  protected readonly _announcement = signal('');

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: string[]) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid());

  protected readonly _effectiveVariant = computed<MudInputChipVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  protected readonly _maxReached = computed(() => {
    const max = this.maxChips();

    return max !== undefined && this.value().length >= max;
  });

  /** @docs-private Locks at max only once the draft is empty, so a leftover draft stays editable. */
  protected readonly _effectiveReadonly = computed(
    () => this.readonly() || (this._maxReached() && this.draft().length === 0),
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
    const classes = ['input-field', 'chip-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'lg') classes.push('input-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudInputFieldStyles);

    // Writes only on a real change: Chrome moves the caret to the end even when the value is unchanged.
    effect(() => {
      const draft = this.draft();
      const native = this._native().nativeElement;

      if (native.value !== draft) native.value = draft;
    });

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      effect(() => {
        const max = this.maxChips();
        const count = this.value().length;

        if (max !== undefined && count > max) {
          console.warn(
            `[mud-input-chip] the bound value holds ${count} chips but maxChips is ${max}, ` +
              `so the field is read-only until enough are removed. ` +
              `Validation applies to typed input, not to the bound value.`,
          );
        }
      });
    }
  }

  writeValue(value: readonly string[] | null | undefined): void {
    this.value.set(value ? [...value] : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  /** @description Focuses the inline input (also used by signal forms' focus requests). */
  focus(options?: FocusOptions): void {
    if (!this._isBrowser) return;

    this._native().nativeElement.focus(options);
  }

  /** Toggles a trailing zero-width space so a repeated message still mutates the live region. */
  private _announce(message: string): void {
    this._announcement.set(this._announcement() === message ? `${message}\u200B` : message);
  }

  // ----- chip mutations -----

  private _rejectedText(error: MudInputChipError): string {
    const custom = this.announceRejected();

    if (custom) return custom(error);

    const text = this._labels().inputChip;

    switch (error.code) {
      case 'pattern':
        return text.rejectedPattern(error.value);
      case 'duplicate':
        return text.rejectedDuplicate(error.value);
      case 'max':
        return text.rejectedMax;
    }
  }

  private _validateChip(value: string): MudInputChipErrorCode | null {
    if (this._maxReached()) return 'max';

    if (this.value().includes(value)) return 'duplicate';

    const pattern = this.validatePattern();

    if (pattern) {
      // A /g or /y regex is stateful across .test() calls; reset lastIndex.
      pattern.lastIndex = 0;

      if (!pattern.test(value)) return 'pattern';
    }

    return null;
  }

  private _addChip(raw: string): boolean {
    const trimmed = raw.trim();

    if (!trimmed) return false;

    const code = this._validateChip(trimmed);

    if (code) {
      const error: MudInputChipError = { code, value: trimmed };

      this.errored.emit(error);
      this._announce(this._rejectedText(error));

      return false;
    }

    const next = [...this.value(), trimmed];

    this.value.set(next);
    this._onChange(next);
    this.draft.set('');
    this._announce(_mudText(this.announceAdded(), this._labels().inputChip.added)(trimmed));
    this.chipAdded.emit({ chip: trimmed, chips: next });

    return true;
  }

  private _removeChip(index: number): void {
    const chip = this.value()[index];

    if (chip === undefined) return;

    const next = this.value().filter((_, i) => i !== index);

    this.value.set(next);
    this._onChange(next);
    this._announce(_mudText(this.announceRemoved(), this._labels().inputChip.removed)(chip));
    this.chipRemoved.emit({ chip, index, chips: next });

    // Refocus a chip or the input; @for tracks by $index, so the target node already exists.
    if (next.length === 0) {
      this.focus();
    } else {
      this._focusChipAt(Math.min(index, next.length - 1));
    }
  }

  private _focusChipAt(index: number): void {
    this._removeButtons()[index]?.nativeElement.focus();
  }

  private _splitOnSeparators(raw: string): string[] {
    const escaped = this.separators()
      .split('')
      .map((sep) => sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(['\\n', ...escaped].join('|'));

    return raw
      .split(pattern)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  protected _onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected _onInputKeydown(event: KeyboardEvent): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      this._addChip(this.draft());

      return;
    }

    if (event.key === 'Escape') {
      // Only swallow Escape with a draft to clear; otherwise it's free for dialogs/overlays.
      if (this.draft().length > 0) {
        event.preventDefault();
        this.draft.set('');
      }

      return;
    }

    if (event.key === 'Backspace' && this.draft().length === 0 && this.value().length > 0) {
      event.preventDefault();
      this._removeChip(this.value().length - 1);

      return;
    }

    if (event.key === 'ArrowLeft' && this.draft().length === 0 && this.value().length > 0) {
      event.preventDefault();
      this._focusChipAt(this.value().length - 1);

      return;
    }

    if (this.separators().includes(event.key)) {
      event.preventDefault();
      this._addChip(this.draft());
    }
  }

  protected _onPaste(event: ClipboardEvent): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    const text = event.clipboardData?.getData('text') ?? '';

    if (!text) return;

    const tokens = this._splitOnSeparators(text);
    const hasSeparator =
      /\n/.test(text) ||
      this.separators()
        .split('')
        .some((sep) => text.includes(sep));

    // A single token without separators behaves like normal typing.
    if (tokens.length <= 1 && !hasSeparator) return;

    event.preventDefault();

    for (const token of tokens) {
      this._addChip(token);

      if (this._maxReached()) break;
    }
  }

  protected _onChipKeydown(event: KeyboardEvent, index: number): void {
    if (this._effectiveDisabled() || this.readonly()) return;

    switch (event.key) {
      case 'Delete':
      case 'Backspace':
      case 'Enter':
      case ' ':
        event.preventDefault();
        this._removeChip(index);

        return;
      case 'ArrowLeft':
        if (index > 0) {
          event.preventDefault();
          this._focusChipAt(index - 1);
        }

        return;
      case 'ArrowRight':
        event.preventDefault();

        if (index < this.value().length - 1) this._focusChipAt(index + 1);
        else this.focus();

        return;
      case 'Escape':
        event.preventDefault();
        this.focus();
    }
  }

  protected _onRemoveClick(event: MouseEvent, index: number): void {
    event.stopPropagation();

    if (this._effectiveDisabled() || this.readonly()) return;

    this._removeChip(index);
  }

  protected _onControlClick(event: MouseEvent): void {
    if (this._effectiveDisabled()) return;

    const target = event.target as Element | null;

    if (target?.closest('.chip-field__chip')) return;

    this.focus();
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
