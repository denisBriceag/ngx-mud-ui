import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { MudFieldHelper, MudFieldLabel } from 'ngx-mud-ui/text-input';
import { MudRadioGroup } from './mud-radio-group.component';

let nextUniqueId = 0;

/**
 * One option inside a {@link MudRadioGroup}. Its checked state DERIVES from
 * the group's value (single source of truth); a radio cannot be used outside
 * a group — for a single yes/no toggle use `mud-checkbox`.
 *
 * `label` / `supportingText` accept the [mudLabel] / [mudHelper] projection
 * overrides from `ngx-mud-ui/text-input`.
 *
 * ```html
 * <mud-radio value="mpay" label="MPay" supportingText="Fără comision." />
 * ```
 */
@Component({
  selector: 'mud-radio',
  templateUrl: './mud-radio.component.html',
  host: {
    '[class]': '_hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudRadio<T = unknown> {
  private readonly _group = inject<MudRadioGroup<T>>(MudRadioGroup);

  /** @description The value this option contributes to the group (compared with Object.is). */
  readonly value = input.required<T>();

  /** @description Plain-text label beside the dot. */
  readonly label = input<string | undefined>(undefined);

  /** @description Secondary line under the label. */
  readonly supportingText = input<string | undefined>(undefined);

  /** @description Disables this option on top of the group-level disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');

  /** @docs-private Focuses this option's native input (used by the group). */
  _focus(options?: FocusOptions): void {
    this._native().nativeElement.focus(options);
  }

  /** @docs-private Projected region markers. */
  protected readonly _projectedLabel = contentChild(MudFieldLabel);
  protected readonly _projectedHelper = contentChild(MudFieldHelper);

  protected readonly _id = `mud-radio-${nextUniqueId++}`;
  protected readonly _supportingId = `${this._id}-supporting`;

  protected readonly _checked = computed(() => Object.is(this._group.value(), this.value()));

  protected readonly _effectiveDisabled = computed(
    () => this.disabled() || this._group._effectiveDisabled(),
  );

  protected readonly _name = computed(() => this._group._name());
  protected readonly _required = computed(() => this._group.required());
  protected readonly _readonly = computed(() => this._group.readonly());
  protected readonly _invalid = computed(() => this._group._effectiveInvalid());

  protected readonly _showLabel = computed(() => !!this._projectedLabel() || !!this.label()?.trim());

  protected readonly _showSupporting = computed(
    () => !!this._projectedHelper() || !!this.supportingText()?.trim(),
  );

  protected readonly _describedBy = computed<string | null>(() =>
    this._showSupporting() ? this._supportingId : null,
  );

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._showLabel()) return null;

    return this.ariaLabel() ?? null;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['selection-control', 'selection-control--radio'];

    if (this._group.size() === 'small') classes.push('selection-control--sm');

    if (this._checked()) classes.push('is-checked');

    if (this._effectiveDisabled()) classes.push('is-disabled');

    if (this._readonly()) classes.push('is-readonly');

    if (this._invalid()) classes.push('is-invalid');

    return classes.join(' ');
  });

  protected _onClick(event: MouseEvent): void {
    if (this._readonly()) event.preventDefault();
  }

  protected _onKeydown(event: KeyboardEvent): void {
    // click-blocking covers pointer and Space, but arrow keys select
    // natively without a click — stop them before the browser acts.
    if (!this._readonly()) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }

  protected _onNativeChange(event: Event): void {
    if ((event.target as HTMLInputElement).checked) this._group._select(this.value());
  }
}
