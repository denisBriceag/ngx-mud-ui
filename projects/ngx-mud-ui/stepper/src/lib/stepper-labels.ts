import { computed, InjectionToken, isSignal } from '@angular/core';
import type { Provider, Signal } from '@angular/core';

/**
 * Screen-reader-only state suffixes a step header announces after its label.
 * Defaults are English; localize an app with one `provideMudStepperLabels`.
 */
export interface MudStepperLabels {
  /** Appended to a completed step's name, e.g. "Identity, completed". */
  completed: string;
  /** Appended to a blocked step's name, e.g. "Address, has errors". */
  blocked: string;
}

export const MUD_STEPPER_LABELS_DEFAULT: MudStepperLabels = {
  completed: 'completed',
  blocked: 'has errors',
};

export const MUD_STEPPER_LABELS = new InjectionToken<MudStepperLabels | Signal<MudStepperLabels>>(
  'MUD_STEPPER_LABELS',
  { providedIn: 'root', factory: () => MUD_STEPPER_LABELS_DEFAULT },
);

/**
 * Overrides only the keys you pass. Accepts a partial, a signal of a partial
 * (steppers re-render when it changes), or a factory returning either.
 *
 * ```ts
 * provideMudStepperLabels({ completed: 'finalizat', blocked: 'conține erori' })
 * ```
 */
export function provideMudStepperLabels(
  labels:
    | Partial<MudStepperLabels>
    | Signal<Partial<MudStepperLabels>>
    | (() => Partial<MudStepperLabels> | Signal<Partial<MudStepperLabels>>),
): Provider {
  const merge = (partial: Partial<MudStepperLabels> | Signal<Partial<MudStepperLabels>>) =>
    isSignal(partial)
      ? computed(() => ({ ...MUD_STEPPER_LABELS_DEFAULT, ...partial() }))
      : { ...MUD_STEPPER_LABELS_DEFAULT, ...partial };

  if (typeof labels === 'function' && !isSignal(labels)) {
    return { provide: MUD_STEPPER_LABELS, useFactory: () => merge(labels()) };
  }

  return { provide: MUD_STEPPER_LABELS, useValue: merge(labels) };
}
