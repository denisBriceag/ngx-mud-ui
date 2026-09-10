import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
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
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import { MudFieldError, MudFieldHelper, MudFieldLabel } from 'ngx-mud-ui/text-input';

export type MudInputChipVariant = 'default' | 'destructive';
export type MudInputChipSize = 'medium' | 'large';
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
 * <mud-input-chip label="Destinatari" [maxChips]="5" [validatePattern]="emailPattern" [formControl]="recipients" />
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

  /** @description Size rung: medium (40px min-height) or large (48px). */
  readonly size = input<MudInputChipSize>('medium');

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  /** @description Destructive visuals + `aria-invalid`. Signal forms bind this automatically. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** @description Confirmed chips — the form value. Two-way bindable; driven by both forms systems. */
  readonly value = model<string[]>([]);

  /** @description The not-yet-confirmed text in the inline input. */
  readonly draft = model('');

  /** @description Maximum chips accepted; further additions emit `errored` with code `max`. */
  readonly maxChips = input<number | undefined>(undefined);

  /**
   * @description Values that don't match are rejected with code `pattern`.
   * Deliberately not named `pattern`: signal forms auto-bind that member with
   * an incompatible protocol (readonly RegExp[] of the field's own validators).
   */
  readonly validatePattern = input<RegExp | undefined>(undefined);

  /** @description Characters that confirm a chip in addition to Enter. Newlines always split pastes. */
  readonly separators = input(',');

  readonly name = input<string>('');

  /** @description Shown only while no chips exist. */
  readonly placeholder = input<string | undefined>(undefined);

  /**
   * @description Validation errors pushed by signal forms; the first message renders as
   * the error line unless `errorText` overrides it.
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  /** @description Plain-text label above the field. */
  readonly label = input<string | undefined>(undefined);

  /** @description Helper/hint below the field. Replaced by the error message when invalid. */
  readonly helperText = input<string | undefined>(undefined);

  /** @description Error message shown below the field when invalid. */
  readonly errorText = input<string | undefined>(undefined);

  /** @description Accessible-label prefix of each chip's remove button. Localize per app. */
  readonly removeLabel = input('Remove');

  /** @description Builds the live-region announcement for an added chip. Localize per app. */
  readonly announceAdded = input<(chip: string) => string>((chip) => `${chip} added`);

  /** @description Builds the live-region announcement for a removed chip. Localize per app. */
  readonly announceRemoved = input<(chip: string) => string>((chip) => `${chip} removed`);

  /** @description Builds the live-region announcement for a rejected value. Localize per app. */
  readonly announceRejected = input<(error: MudInputChipError) => string>((error) => {
    switch (error.code) {
      case 'pattern':
        return `${error.value} is not in the expected format`;
      case 'duplicate':
        return `${error.value} is already added`;
      case 'max':
        return 'Maximum number of values reached';
    }
  });

  /** @description Accessible name used when no visible `label` is set. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @description Extra id(s) merged into the native control's aria-describedby. */
  readonly ariaDescribedby = input<string | undefined>(undefined, { alias: 'aria-describedby' });

  /** Fired when a chip is confirmed. */
  readonly chipAdded = output<MudInputChipAdd>();

  /** Fired when a chip is removed. */
  readonly chipRemoved = output<MudInputChipRemove>();

  /** Fired for every rejected value (pattern / duplicate / max). */
  readonly errored = output<MudInputChipError>();

  /** Signal-forms touch contract: emitted when focus leaves the inline input. */
  readonly touch = output<void>();

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');
  private readonly _removeButtons = viewChildren<ElementRef<HTMLButtonElement>>('removeBtn');
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @docs-private Projected region markers ([mudLabel] / [mudHelper] / [mudError]). */
  protected readonly _projectedLabel = contentChild(MudFieldLabel);
  protected readonly _projectedHelper = contentChild(MudFieldHelper);
  protected readonly _projectedError = contentChild(MudFieldError);

  protected readonly _id = `mud-input-chip-${nextUniqueId++}`;
  protected readonly _labelId = `${this._id}-label`;
  protected readonly _helperId = `${this._id}-helper`;
  protected readonly _errorId = `${this._id}-error`;

  protected readonly _focused = signal(false);

  /** @docs-private role=status live text announcing add / remove / reject. */
  protected readonly _announcement = signal('');

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: string[]) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  /** @docs-private Input + forms-driven disabled state combined. */
  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  protected readonly _effectiveInvalid = computed(() => this.invalid() || this.errors().length > 0);

  protected readonly _effectiveVariant = computed<MudInputChipVariant>(() =>
    this._effectiveInvalid() ? 'destructive' : this.variant(),
  );

  protected readonly _maxReached = computed(() => {
    const max = this.maxChips();

    return max !== undefined && this.value().length >= max;
  });

  /**
   * @docs-private The input locks at max only once the draft is empty: a
   * leftover draft (typed before a paste filled the last slots) must stay
   * editable, or readOnly would trap it.
   */
  protected readonly _effectiveReadonly = computed(
    () => this.readonly() || (this._maxReached() && this.draft().length === 0),
  );

  protected readonly _errorMessage = computed<string | undefined>(() => {
    if (!this._effectiveInvalid()) return undefined;

    const explicit = this.errorText()?.trim();

    if (explicit) return explicit;

    return this.errors().find((error) => error.message)?.message ?? undefined;
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

  protected readonly _showLabel = computed(
    () => !!this._projectedLabel() || !!this.label()?.trim(),
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
    const classes = ['input-field', 'chip-field', `input-field--${this._effectiveVariant()}`];

    if (this.size() === 'large') classes.push('input-field--lg');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this.readonly()) classes.push('is-readonly');

    if (this._effectiveInvalid()) classes.push('is-invalid');

    if (this._focused() && !this._effectiveDisabled()) classes.push('is-focused');

    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;

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

  /**
   * A repeated message (same value rejected twice) would leave the live
   * region's DOM unchanged and never re-announce — alternate a trailing
   * zero-width space to force a mutation screen readers pick up.
   */
  private _announce(message: string): void {
    this._announcement.set(this._announcement() === message ? `${message}\u200B` : message);
  }

  // ----- chip mutations -----

  private _validateChip(value: string): MudInputChipErrorCode | null {
    if (this._maxReached()) return 'max';

    if (this.value().includes(value)) return 'duplicate';

    const pattern = this.validatePattern();

    if (pattern) {
      // A /g or /y regex is stateful across .test() calls; reset it so a
      // consumer-supplied global flag can't make validation alternate.
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
      this._announce(this.announceRejected()(error));

      return false;
    }

    const next = [...this.value(), trimmed];

    this.value.set(next);
    this._onChange(next);
    this.draft.set('');
    this._announce(this.announceAdded()(trimmed));
    this.chipAdded.emit({ chip: trimmed, chips: next });

    return true;
  }

  private _removeChip(index: number): void {
    const chip = this.value()[index];

    if (chip === undefined) return;

    const next = this.value().filter((_, i) => i !== index);

    this.value.set(next);
    this._onChange(next);
    this._announce(this.announceRemoved()(chip));
    this.chipRemoved.emit({ chip, index, chips: next });

    // Keyboard removals need focus to land somewhere predictable: the chip
    // now occupying this index, the new last chip, or back on the input.
    // @for tracks by $index, so the target button node already exists.
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
      // Only swallow Escape while it has a draft to clear; otherwise it
      // stays free for consumers (dialogs, overlays).
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
