import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import type { StepControl } from '@angular/cdk/stepper';
import { CdkStep } from '@angular/cdk/stepper';
import { Subject } from 'rxjs';

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

  /** @docs-private Fires when `stepControl` is rebound, so the stepper re-watches it. */
  readonly _stepControlChanges = new Subject<void>();

  private _watchedControl: StepControl | undefined;

  // CdkStep.ngOnChanges takes no SimpleChanges, so the swap is detected by identity.
  override ngOnChanges(): void {
    super.ngOnChanges();

    if (this.stepControl !== this._watchedControl) {
      this._watchedControl = this.stepControl;
      this._stepControlChanges.next();
    }
  }
}
