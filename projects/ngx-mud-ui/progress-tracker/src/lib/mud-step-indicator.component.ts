import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
} from '@angular/core';

declare const ngDevMode: boolean | undefined;

const isDevMode = (): boolean => typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * One entry of an {@link MudStepIndicator}. Projected content renders
 * under the heading as supporting text and/or an action.
 */
@Component({
  selector: 'mud-indicator-step',
  template: `
    <span class="indicator-step__connector" aria-hidden="true"></span>
    <span class="indicator-step__circle" aria-hidden="true">{{ _number() }}</span>
    <div class="indicator-step__body">
      <span class="indicator-step__heading">{{ heading() }}</span>
      <div class="indicator-step__content"><ng-content /></div>
    </div>
  `,
  host: {
    class: 'indicator-step',
    role: 'listitem',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudIndicatorStep {
  private readonly _indicator = inject<MudStepIndicator>(forwardRef(() => MudStepIndicator));

  readonly heading = input.required<string>();

  private _warnedNotFound = false;

  protected readonly _number = computed(() => {
    const index = this._indicator.steps().indexOf(this);

    if (index === -1) {
      if (isDevMode() && !this._warnedNotFound) {
        this._warnedNotFound = true;
        console.warn(
          'mud-indicator-step: not found among the direct children of mud-step-indicator; ' +
            'the step cannot be numbered. Do not wrap mud-indicator-step in another element.',
        );
      }

      return null;
    }

    return index + 1;
  });
}

/**
 * ```html
 * <mud-step-indicator>
 *   <mud-indicator-step heading="Create account">
 *     Supporting text
 *     <button mud-button>Start</button>
 *   </mud-indicator-step>
 * </mud-step-indicator>
 * ```
 */
@Component({
  selector: 'mud-step-indicator',
  template: '<ng-content />',
  host: {
    class: 'step-indicator',
    role: 'list',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudStepIndicator {
  readonly steps = contentChildren(MudIndicatorStep);
}
