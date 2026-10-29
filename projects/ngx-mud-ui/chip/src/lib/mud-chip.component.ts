import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _mudText, injectMudLabels } from 'ngx-mud-ui/i18n';
import { _MudChipStyles } from './mud-chip-styles.component';

export type MudChipType = 'filter' | 'input';
export type MudChipSize = 'sm' | 'md';

/** `mono` is radio-like; `multi` is checkbox-like with a leading check. */
export type MudChipSelectionMode = 'mono' | 'multi';

/**
 * ```html
 * <mud-chip selectionMode="multi" [(selected)]="active" [count]="12">Acte</mud-chip>
 * <mud-chip type="input" removable (removed)="drop(tag)">{{ tag }}</mud-chip>
 * ```
 */
@Component({
  selector: 'mud-chip',
  templateUrl: './mud-chip.component.html',
  imports: [NgTemplateOutlet],
  host: {
    '[class]': '_hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudChip {
  /** @description Behavioral mode: `filter` toggles on click, `input` is a static token. */
  readonly type = input<MudChipType>('filter');

  /** @description Size rung: `md` (36px) or `sm` (28px). */
  readonly size = input<MudChipSize>('md');

  /** @description Selected state for `type="filter"`. Two-way bindable; ignored for `input`. */
  readonly selected = model(false);

  /** @description In `multi` mode a leading check renders automatically while selected. */
  readonly selectionMode = input<MudChipSelectionMode>('mono');

  /** @description Optional numeric badge after the label. */
  readonly count = input<number | undefined>(undefined);

  /** @description Blocks toggling and removing. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description For `type="input"`: renders the trailing close button that emits `removed`. */
  readonly removable = input(false, { transform: booleanAttribute });

  /** @description ARIA-only name; also feeds the remove button's accessible name. */
  readonly label = input<string | undefined>(undefined);

  /** @description Builds the remove button's accessible name from the chip's `label`. */
  readonly removeLabel = input<((label: string) => string) | undefined>(undefined);

  /** @description Fired when the remove button is activated. */
  readonly removed = output<void>();

  protected readonly _isFilter = computed(() => this.type() === 'filter');

  /** @docs-private `model()` has no `booleanAttribute` transform; a bare `selected` attribute delivers `''`. */
  protected readonly _selected = computed(() => booleanAttribute(this.selected()));

  protected readonly _showRemove = computed(() => this.type() === 'input' && this.removable());

  protected readonly _showCheck = computed(
    () => this._isFilter() && this.selectionMode() === 'multi' && this._selected(),
  );

  protected readonly _showCount = computed(() => Number.isFinite(this.count()));

  private readonly _labels = injectMudLabels();

  protected readonly _removeAriaLabel = computed(() =>
    _mudText(this.removeLabel(), this._labels().chip.remove)(this.label()?.trim() ?? '').trim(),
  );

  protected readonly _hostClasses = computed(() => {
    const classes = ['chip', `chip--${this.type()}`];

    if (this.size() === 'sm') classes.push('chip--sm');

    if (this._isFilter() && this._selected()) classes.push('is-selected');

    if (this.disabled()) classes.push('is-disabled');

    if (this._showRemove()) classes.push('is-removable');

    if (this._showCheck()) classes.push('shows-check');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudChipStyles);
  }

  protected _toggle(): void {
    if (this.disabled() || !this._isFilter()) return;

    this.selected.set(!this._selected());
  }

  protected _onRemove(): void {
    if (this.disabled()) return;

    this.removed.emit();
  }
}
