import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
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
  readonly label = input('');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);

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
