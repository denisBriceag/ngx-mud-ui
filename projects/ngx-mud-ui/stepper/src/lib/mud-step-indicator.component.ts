import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { injectMudFormatLocale } from 'ngx-mud-ui/i18n';
import { _MudStepperStyles } from './mud-stepper-styles.component';

declare const ngDevMode: boolean | undefined;

/** One entry of a {@link MudStepIndicator}; projected content renders under the heading. */
@Component({
  selector: 'mud-indicator-step',
  template: `
    <span class="indicator-step__connector" aria-hidden="true"></span>
    <span class="indicator-step__circle" aria-hidden="true">{{ _numberText() }}</span>
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

  private readonly _formatLocale = injectMudFormatLocale();

  private _warnedNotFound = false;

  protected readonly _number = computed(() => {
    const index = this._indicator.steps().indexOf(this);

    if (index === -1) {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && !this._warnedNotFound) {
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

  protected readonly _numberText = computed(() => {
    const number = this._number();

    return number === null ? '' : new Intl.NumberFormat(this._formatLocale(), { useGrouping: false }).format(number);
  });

  constructor() {
    inject(MudStyleLoader).load(_MudStepperStyles);
  }
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
