import { booleanAttribute, Component, computed, contentChild, input, signal, TemplateRef, viewChild } from '@angular/core';
import { EgovTabLabel } from './egov-tab-label.directive';

let uniqueId = 0;

/**
 * A single tab. Its projected content is captured as a lazy template and
 * rendered by the parent `egov-tab-group` into the active panel.
 *
 * ```html
 * <egov-tab label="Overview">…content…</egov-tab>
 * ```
 */
@Component({
  selector: 'egov-tab',
  template: `<ng-template><ng-content /></ng-template>`,
})
export class EgovTab {
  readonly label = input('');
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);

  readonly content = viewChild.required(TemplateRef);
  readonly templateLabel = contentChild(EgovTabLabel);

  readonly isActive = signal(false);
  readonly position = signal(0);

  private readonly _uid = `egov-tab-${uniqueId++}`;

  readonly tabId = computed(() => this.id() ?? this._uid);
}
