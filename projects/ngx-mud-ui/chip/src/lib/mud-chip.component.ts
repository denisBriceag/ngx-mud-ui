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
export type MudChipSize = 'small' | 'medium';

/**
 * Selection behaviour for `type="filter"`:
 * - `mono` — single-choice (radio-like); the selected chip just flips color.
 * - `multi` — multi-choice (checkbox-like); a leading check appears when selected.
 */
export type MudChipSelectionMode = 'mono' | 'multi';

/**
 * Compact pill for filter selection or token display.
 *
 * - `type="filter"` (default): a toggle button — click flips `selected`
 *   (`aria-pressed` exposed). Mono-exclusivity across a group is
 *   consumer-owned via `selectedChange`.
 * - `type="input"`: a discrete user-entered value. The body is static (no
 *   dead tab stop); with `removable`, a trailing close button emits `removed`.
 *
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

  /** @description Size rung: medium (36px) or small (28px). */
  readonly size = input<MudChipSize>('medium');

  /** @description Selected state for `type="filter"`. Two-way bindable; ignored for `input`. */
  readonly selected = model(false);

  /** @description In `multi` mode a leading check renders automatically while selected. */
  readonly selectionMode = input<MudChipSelectionMode>('mono');

  /** @description Optional numeric badge after the label; its colors invert with the surface. */
  readonly count = input<number | undefined>(undefined);

  readonly disabled = input(false, { transform: booleanAttribute });

  /** @description For `type="input"`: renders the trailing close button that emits `removed`. */
  readonly removable = input(false, { transform: booleanAttribute });

  /**
   * @description ARIA-only fallback name (mud-button convention): applied as `aria-label`
   * when set, and appended to the remove button's accessible name. Visible
   * text belongs in the default content.
   */
  readonly label = input<string | undefined>(undefined);

  /** @description Builds the remove button's accessible name from the chip's `label`. */
  readonly removeLabel = input<((label: string) => string) | undefined>(undefined);

  /** Fired when the remove button of a removable `input` chip is activated. */
  readonly removed = output<void>();

  protected readonly _isFilter = computed(() => this.type() === 'filter');

  /**
   * @docs-private `model()` has no `booleanAttribute` transform, so a static
   * `selected` attribute delivers `''` — coerce it here (present = true) and
   * read only this everywhere (class, check, aria-pressed, toggle).
   */
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

    if (this.size() === 'small') classes.push('chip--sm');

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
