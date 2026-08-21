import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { CdkStep } from '@angular/cdk/stepper';

/**
 * ```html
 * <mud-step label="Identity" supportingText="Who you are" [stepControl]="identityForm">
 *   …step content…
 * </mud-step>
 * ```
 */
@Component({
  selector: 'mud-step',
  template: '<ng-template><ng-content /></ng-template>',
  providers: [{ provide: CdkStep, useExisting: MudStep }],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudStep extends CdkStep {
  readonly supportingText = input<string | undefined>(undefined);
}
