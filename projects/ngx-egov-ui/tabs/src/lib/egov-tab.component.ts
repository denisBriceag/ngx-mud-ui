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
import { EgovTabLabel } from './egov-tab-label.directive';

let uniqueId = 0;

/**
 * ```html
 * <egov-tab label="Overview">…content…</egov-tab>
 * ```
 */
@Component({
  selector: 'egov-tab',
  template: `<ng-template><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EgovTab {
  readonly label = input('');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);

  readonly content = viewChild.required(TemplateRef);
  readonly templateLabel = contentChild(EgovTabLabel);

  /** @docs-private Written by EgovTabGroup only. */
  readonly _isActive = signal(false);
  /** @docs-private Written by EgovTabGroup only. */
  readonly _position = signal(0);

  /** Whether this tab is the group's selected tab. */
  readonly isActive = this._isActive.asReadonly();

  /** This tab's index within the group. */
  readonly position = this._position.asReadonly();

  private readonly _uid = `egov-tab-${uniqueId++}`;

  readonly tabId = computed(() => this.id() ?? this._uid);
}
