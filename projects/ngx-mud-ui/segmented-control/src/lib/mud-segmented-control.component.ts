import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

export type MudSegmentedControlSize = 'medium' | 'small';

/**
 * @description A segment created inside @for receives its [value] binding one change-
 * detection pass AFTER the group's content query already sees the segment,
 * so reading the required input in that window throws NG0950. Reads from
 * the group go through {@link MudSegment._valueOrUnset} instead, which
 * reports this sentinel until the binding is applied.
 * */
const VALUE_UNSET = Symbol('mud-segment-value-unset');

/** Emitted by {@link MudSegmentedControl.selectionChange} whenever the selection lands on a segment. */
export interface MudSegmentedControlChange<T> {
  value: T;
  segment: MudSegment<T>;
}

/**
 * One choice inside an {@link MudSegmentedControl}. Applied to a native
 * button so the DOM matches the design-system CSS contract
 * (`.segmented-control > .segment-item`).
 *
 * Keep labels short; an unavoidable long label truncates to one line with
 * an ellipsis. Truncation is visual-only (the full text stays in the
 * accessible name). If you want a tooltip on a truncated segment, compose
 * `mudTooltip` from `ngx-mud-ui/tooltip` on the same button element —
 * this component deliberately doesn't add one itself.
 *
 * ```html
 * <button mud-segment value="list"><mud-icon name="list" />List</button>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[mud-segment]',
  template: `
    <ng-content select="mud-icon,svg" />
    <span class="segment-label"><ng-content /></span>
  `,
  host: {
    class: 'segment-item',
    type: 'button',
    role: 'radio',
    '[class.is-selected]': '_selected()',
    '[attr.aria-checked]': '_selected()',
    '[disabled]': '_isDisabled()',
    '[attr.tabindex]': '_tabIndex()',
    '(click)': '_onClick()',
    '(keydown)': '_onKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudSegment<T = unknown> {
  private readonly _group = inject<MudSegmentedControl<T>>(forwardRef(() => MudSegmentedControl));
  private readonly _elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  readonly value = input.required<T>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly _selected = computed(() => this._group._isSelected(this));
  protected readonly _isDisabled = computed(() => this.disabled() || this._group._effectiveDisabled());
  protected readonly _tabIndex = computed(() => this._group._tabIndexFor(this));

  /** @docs-private */
  _focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /**
   * @docs-private The read still registers the reactive dependency before NG0950 is
   * thrown, so effects/computeds using this re-run once the binding lands.
   * */
  _valueOrUnset(): T | typeof VALUE_UNSET {
    try {
      return this.value();
    } catch {
      return VALUE_UNSET;
    }
  }

  protected _onClick(): void {
    this._group._select(this);
  }

  protected _onKeydown(event: KeyboardEvent): void {
    this._group._handleKeydown(event, this);
  }
}

/**
 * Works standalone via `[(value)]` or inside reactive/template-driven forms
 * (implements ControlValueAccessor, so `formControlName`/`ngModel` and form
 * resets behave like any native control).
 *
 * ```html
 * <mud-segmented-control [(value)]="view" aria-label="View">
 *   <button mud-segment value="list">List</button>
 *   <button mud-segment value="grid">Grid</button>
 * </mud-segmented-control>
 * ```
 */
@Component({
  selector: 'mud-segmented-control',
  template: '<ng-content />',
  host: {
    class: 'segmented-control',
    role: 'radiogroup',
    '[class.segmented-control--full-width]': 'fullWidth()',
    '[class.segmented-control--sm]': "size() === 'small'",
    '[class.segmented-control--disabled]': '_effectiveDisabled()',
    '[attr.aria-disabled]': '_effectiveDisabled() ? "true" : null',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby()',
    '(focusout)': '_onFocusout($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MudSegmentedControl),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudSegmentedControl<T = unknown>
  implements ControlValueAccessor, FormValueControl<T | undefined>
{
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly segments = contentChildren<MudSegment<T>>(MudSegment);

  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly size = input<MudSegmentedControlSize>('medium');
  readonly value = model<T | undefined>(undefined);

  /**
   * @description Validation errors pushed by signal forms. The segmented control has no
   * error region of its own (it is a view switcher, not a field), so bind them
   * to a message beside it when they need to be shown.
   */
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);

  readonly selectionChange = output<MudSegmentedControlChange<T>>();

  /** Signal-forms touch contract: emitted when focus leaves the group. */
  readonly touch = output<void>();

  private readonly _cvaDisabled = signal(false);
  private _onChange: (value: T | undefined) => void = () => undefined;
  /** @docs-private */
  protected _onTouched: () => void = () => undefined;

  /** @docs-private Combined input + forms-driven disabled state. */
  readonly _effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled());

  private _lastEmitted: T | undefined;
  private _lastIndex = 0;
  private _initialized = false;

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

  /** @docs-private Focus moving between segments is not leaving the control. */
  protected _onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;

    if (next && this._host.contains(next)) return;

    this._onTouched();
    this.touch.emit();
  }

  constructor() {
    effect(() => {
      const segments = this.segments();
      const value = this.value();

      if (segments.length === 0) {
        return;
      }

      const values = segments.map((segment) => segment._valueOrUnset());

      if (values.includes(VALUE_UNSET)) {
        return;
      }

      const index = values.findIndex((segmentValue) => Object.is(segmentValue, value));
      const current = index >= 0 ? segments[index] : undefined;

      if (value !== undefined && !this._effectiveDisabled() && (!current || current.disabled())) {
        const fallback = this._closestEnabled(current ? index : this._lastIndex);

        if (fallback >= 0 && fallback !== index) {
          this.value.set(segments[fallback].value());

          return;
        }
      }

      const first = !this._initialized;

      this._initialized = true;

      if (current) {
        this._lastIndex = index;

        if (!first && !Object.is(this._lastEmitted, value)) {
          this.selectionChange.emit({ value: current.value(), segment: current });
        }
      }

      this._lastEmitted = value;
    });
  }

  /** @docs-private */
  _isSelected(segment: MudSegment<T>): boolean {
    return Object.is(this.value(), segment._valueOrUnset());
  }

  /** @docs-private */
  _tabIndexFor(segment: MudSegment<T>): number {
    const segments = this.segments();
    const value = this.value();
    let target = segments.find((s) => !s.disabled() && Object.is(s._valueOrUnset(), value));

    target ??= segments.find((s) => !s.disabled());

    return segment === target ? 0 : -1;
  }

  /** @docs-private */
  _select(segment: MudSegment<T>): void {
    if (segment.disabled() || this._effectiveDisabled()) {
      return;
    }

    this.value.set(segment.value());
    this._onChange(segment.value());
  }

  /** @docs-private */
  _handleKeydown(event: KeyboardEvent, segment: MudSegment<T>): void {
    const segments = this.segments();
    const count = segments.length;

    if (count === 0) {
      return;
    }

    const from = segments.indexOf(segment);
    let target: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = this._nextEnabled(from, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = this._nextEnabled(from, -1);
        break;
      case 'Home':
        target = this._nextEnabled(-1, 1);
        break;
      case 'End':
        target = this._nextEnabled(count, -1);
        break;
      default:
        return;
    }

    event.preventDefault();

    const next = segments[target];

    if (!next || next.disabled() || this._effectiveDisabled()) {
      return;
    }

    this.value.set(next.value());
    this._onChange(next.value());

    if (this._isBrowser) {
      next._focus();
    }
  }

  private _closestEnabled(from: number): number {
    const segments = this.segments();

    for (let i = Math.min(from, segments.length - 1); i >= 0; i--) {
      if (!segments[i].disabled()) return i;
    }

    for (let i = from + 1; i < segments.length; i++) {
      if (!segments[i].disabled()) return i;
    }

    return -1;
  }

  private _nextEnabled(from: number, direction: 1 | -1): number {
    const segments = this.segments();
    const count = segments.length;
    let index = from;

    for (let step = 0; step < count; step++) {
      index = (index + direction + count) % count;

      if (!segments[index].disabled()) {
        return index;
      }
    }

    return Math.max(0, Math.min(from, count - 1));
  }
}
