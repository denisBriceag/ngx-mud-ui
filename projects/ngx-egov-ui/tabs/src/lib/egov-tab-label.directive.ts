import { Directive } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';

/**
 * ```html
 * <egov-tab>
 *   <ng-template egovTabLabel>
 *     <egov-icon name="alarm" /> Alerts <span class="badge">3</span>
 *   </ng-template>
 *   …content…
 * </egov-tab>
 * ```
 *
 * Extends `CdkPortal` so the group can project it into the tab button.
 */
@Directive({ selector: '[egovTabLabel]' })
export class EgovTabLabel extends CdkPortal {}
