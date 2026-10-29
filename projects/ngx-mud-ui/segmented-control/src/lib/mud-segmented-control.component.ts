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
  ViewEncapsulation,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';

export type MudSegmentedControlSize = 'medium' | 'small';

/** A @for segment's [value] lands one CD pass after the content query sees it (NG0950); this sentinel covers that window. */
const VALUE_UNSET = Symbol('mud-segment-value-unset');

/** Emitted by {@link MudSegmentedControl.selectionChange} whenever the selection lands on a segment. */
export interface MudSegmentedControlChange<T> {
  value: T;
  segment: MudSegment<T>;
}

/**
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

  /** @description The value this segment selects. */
  readonly value = input.required<T>();
  /** @description Disables this segment. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly _selected = computed(() => this._group._isSelected(this));
  protected readonly _isDisabled = computed(() => this.disabled() || this._group._effectiveDisabled());
  protected readonly _tabIndex = computed(() => this._group._tabIndexFor(this));

  /** @docs-private */
  _focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** @docs-private The read registers the dependency before NG0950 throws, so callers re-run when the binding lands. */
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
 * ```html
 * <mud-segmented-control [(value)]="view" aria-label="View">
 *   <button mud-segment value="list">List</button>
 *   <button mud-segment value="grid">Grid</button>
 * </mud-segmented-control>
 * ```
 */
@Component({
  selector: 'mud-segmented-control',
  styleUrl: './mud-segmented-control.component.scss',
  encapsulation: ViewEncapsulation.None,
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

  /** @description Accessible name of the group. Set it, or `aria-labelledby`: the control has no visible label. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** @description Id of an element that names the group. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  /** @description Disables every segment. Both forms systems set it for you. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Stretches the control and its segments to the container width, for phones. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** @description Height and text size. */
  readonly size = input<MudSegmentedControlSize>('medium');
  /** @description The selected segment's value. Two-way bindable; also driven by both forms systems. */
  readonly value = model<T | undefined>(undefined);

  /** @description Fires when the user selects a segment, with its value and the segment. */
  readonly selectionChange = output<MudSegmentedControlChange<T>>();

  /** @description Fires when focus leaves the group; signal forms use it to mark the field touched. */
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
