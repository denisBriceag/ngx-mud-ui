import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  numberAttribute,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MudTabLabel } from './mud-tab-label.directive';

let uniqueId = 0;

/**
 * ```html
 * <mud-tab label="Overview">…content…</mud-tab>
 * ```
 */
@Component({
  selector: 'mud-tab',
  template: `<ng-template><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudTab {
  /** @description Plain-text label; for richer content use an `ng-template mudTabLabel`. */
  readonly label = input('');
  /** @description Accessible name for the tab, when the label alone isn't enough. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** @description Id of an element that names the tab. */
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  /** @description Makes the tab unselectable; the keyboard skips it. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Id for the tab button; the panel gets the same id plus `-panel`. */
  readonly id = input<string | undefined>(undefined);
  /** @description Count pill after the label; null hides it. */
  readonly badgeCount = input<number | null, number | string | null | undefined>(null, {
    transform: (value) => (value == null || value === '' ? null : numberAttribute(value)),
  });

  readonly content = viewChild.required(TemplateRef);
  readonly templateLabel = contentChild(MudTabLabel);

  /** @docs-private Written by MudTabGroup only. */
  readonly _isActive = signal(false);
  /** @docs-private Written by MudTabGroup only. */
  readonly _position = signal(0);

  /** Whether this tab is the group's selected tab. */
  readonly isActive = this._isActive.asReadonly();

  /** This tab's index within the group. */
  readonly position = this._position.asReadonly();

  private readonly _uid = `mud-tab-${uniqueId++}`;

  readonly tabId = computed(() => this.id() ?? this._uid);
}
