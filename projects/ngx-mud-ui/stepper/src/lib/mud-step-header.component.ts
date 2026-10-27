import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CdkStepHeader } from '@angular/cdk/stepper';

/** @docs-private All five visual states a stepper step can be in. */
export const MUD_STEP_STATES = ['current', 'completed', 'incomplete', 'blocked', 'available'] as const;

export type MudStepState = (typeof MUD_STEP_STATES)[number];

/** @docs-private Visual header of one stepper step, rendered by {@link MudStepper}. */
@Component({
  selector: 'mud-step-header',
  template: `
    <span class="stepper-step__circle" aria-hidden="true">
      @switch (state()) {
        @case ('completed') {
          <svg class="stepper-step__icon stepper-step__icon--check" viewBox="0 0 12 10" fill="none">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M11.3268 0.19795C11.6593 0.488895 11.693 0.994305 11.4021 1.32681L4.40206 9.32681C4.25626 9.49345 4.04792 9.5922 3.82662 9.59957C3.60533 9.60694 3.39088 9.52226 3.23431 9.3657L0.234315 6.3657C-0.0781049 6.05328 -0.0781049 5.54675 0.234315 5.23433C0.546734 4.92191 1.05327 4.92191 1.36569 5.23433L3.76103 7.62967L10.1979 0.273207C10.4889 -0.059302 10.9943 -0.092996 11.3268 0.19795Z"
              fill="currentColor"
            />
          </svg>
        }
        @case ('blocked') {
          <svg class="stepper-step__icon stepper-step__icon--blocked" viewBox="0 0 3 12" fill="none">
            <path
              d="M0.35197 7.68001L0.15997 1.14441e-05H2.01597L1.82397 7.68001H0.35197ZM1.08797 11.44C0.89597 11.44 0.714637 11.3973 0.54397 11.312C0.38397 11.2267 0.250637 11.0987 0.14397 10.928C0.0479703 10.7573 -2.96831e-05 10.5653 -2.96831e-05 10.352C-2.96831e-05 10.1173 0.0479703 9.92001 0.14397 9.76001C0.23997 9.58934 0.373304 9.46134 0.54397 9.37601C0.714637 9.29068 0.901304 9.24801 1.10397 9.24801C1.39197 9.24801 1.64264 9.34934 1.85597 9.55201C2.07997 9.74401 2.19197 10.0107 2.19197 10.352C2.19197 10.5653 2.13864 10.7573 2.03197 10.928C1.93597 11.0987 1.80264 11.2267 1.63197 11.312C1.47197 11.3973 1.29064 11.44 1.08797 11.44Z"
              fill="currentColor"
            />
          </svg>
        }
        @default {
          <span class="stepper-step__number">{{ index() + 1 }}</span>
        }
      }
    </span>
    @if (label() || secondaryText()) {
      <span class="stepper-step__label">
        @if (label()) {
          <span class="stepper-step__heading">{{ label() }}</span>
        }
        @if (secondaryText(); as text) {
          <span class="stepper-step__supporting">{{ text }}</span>
        }
      </span>
    }
    @if (stateLabel(); as text) {
      <!-- The check / exclamation glyphs are aria-hidden; this names the state for AT. -->
      <span class="stepper-step__state">, {{ text }}</span>
    }
  `,
  host: {
    class: 'stepper-step__header',
    // Overrides CdkStepHeader's role="tab": a tablist can't hold the vertical inline panels.
    role: 'button',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudStepHeader extends CdkStepHeader {
  readonly state = input.required<MudStepState>();
  readonly index = input.required<number>();
  readonly label = input<string | undefined>(undefined);
  readonly secondaryText = input<string | undefined>(undefined);
  readonly stateLabel = input<string | undefined>(undefined);
}
