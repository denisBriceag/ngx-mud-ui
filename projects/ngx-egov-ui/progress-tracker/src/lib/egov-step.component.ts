import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { CdkStep } from '@angular/cdk/stepper';

/**
 * ```html
 * <egov-step label="Identity" supportingText="Who you are" [stepControl]="identityForm">
 *   …step content…
 * </egov-step>
 * ```
 */
@Component({
  selector: 'egov-step',
  template: '<ng-template><ng-content /></ng-template>',
  providers: [{ provide: CdkStep, useExisting: EgovStep }],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EgovStep extends CdkStep {
  readonly supportingText = input<string | undefined>(undefined);
}
