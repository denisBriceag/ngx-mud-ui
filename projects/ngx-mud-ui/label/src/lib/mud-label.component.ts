import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * ```html
 * <mud-text-input [formField]="form.idnp" required>
 *   <mud-label>IDNP <mud-icon name="circle-info" /></mud-label>
 * </mud-text-input>
 * ```
 */
@Component({
  selector: 'mud-label',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudLabel {}
