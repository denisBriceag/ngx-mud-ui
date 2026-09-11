import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudRadioGroup } from './mud-radio-group.component';

let nextUniqueId = 0;

/**
 * One option inside a {@link MudRadioGroup}. Its checked state DERIVES from
 * the group's value (single source of truth); a radio cannot be used outside
 * a group — for a single yes/no toggle use `mud-checkbox`.
 *
 * ```html
 * <mud-radio value="mpay">
 *   <mud-label>MPay</mud-label>
 *   <mud-inline-message hideIcon>Fără comision.</mud-inline-message>
 * </mud-radio>
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

  /** @description Disables this option on top of the group-level disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description Accessible name when no visible label is rendered. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly _native = viewChild.required<ElementRef<HTMLInputElement>>('native');

  /** @docs-private Focuses this option's native input (used by the group). */
  _focus(options?: FocusOptions): void {
    this._native().nativeElement.focus(options);
  }

  /** @docs-private Projected label element (ngx-mud-ui/label). */
  protected readonly _label = contentChild(MudLabel);

  /** @docs-private Consumer-projected assistive messages. */
  private readonly _messages = contentChildren(MudInlineMessage);

  protected readonly _hasLabel = computed(() => !!this._label());

  protected readonly _hasMessages = computed(() => this._messages().length > 0);

  protected readonly _id = `mud-radio-${nextUniqueId++}`;
  protected readonly _assistiveId = `${this._id}-assistive`;

  protected readonly _checked = computed(() => Object.is(this._group.value(), this.value()));

  protected readonly _effectiveDisabled = computed(
    () => this.disabled() || this._group._effectiveDisabled(),
  );

  protected readonly _name = computed(() => this._group._name());
  protected readonly _required = computed(() => this._group.required());
  protected readonly _readonly = computed(() => this._group.readonly());
  protected readonly _invalid = computed(() => this._group._effectiveInvalid());

  protected readonly _describedBy = computed<string | null>(() =>
    this._hasMessages() ? this._assistiveId : null,
  );

  protected readonly _ariaLabel = computed<string | null>(() => {
    if (this._hasLabel()) return null;

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
