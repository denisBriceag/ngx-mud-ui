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
 */
@Directive({ selector: '[mudTabLabel]' })
export class MudTabLabel extends CdkPortal {}
