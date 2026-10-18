import { Directive } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';

/**
 * ```html
 * <mud-tab>
 *   <ng-template mudTabLabel>
 *     <mud-icon name="alarm" /> Alerts <mud-badge [count]="3" variant="neutral" size="xl" />
 *   </ng-template>
 *   …content…
 * </mud-tab>
 * ```
 *
 * Extends `CdkPortal` so the group can project it into the tab button.
 */
@Directive({ selector: '[mudTabLabel]' })
export class MudTabLabel extends CdkPortal {}
