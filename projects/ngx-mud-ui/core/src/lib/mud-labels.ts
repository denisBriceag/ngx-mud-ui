import { computed, inject, isSignal } from '@angular/core';
import type { InjectionToken, Provider, Signal } from '@angular/core';

/** What a `provideMud*Labels` accepts: a partial, a signal of one, or a factory returning either. */
export type _MudLabelsInput<T> = Partial<T> | Signal<Partial<T>> | (() => Partial<T> | Signal<Partial<T>>);

/**
 * Provides `token` as `defaults` overlaid with `labels`; a factory runs in an injection context.
 * ```ts
 * return _provideMudLabels(MUD_TIME_LABELS, MUD_TIME_LABELS_DEFAULT, labels);
 * ```
 */
export function _provideMudLabels<T extends object>(
  token: InjectionToken<T | Signal<T>>,
  defaults: T,
  labels: _MudLabelsInput<T>,
): Provider {
  const merge = (partial: Partial<T> | Signal<Partial<T>>): T | Signal<T> =>
    isSignal(partial) ? computed(() => ({ ...defaults, ...partial() })) : { ...defaults, ...partial };

  if (typeof labels === 'function' && !isSignal(labels)) {
    return { provide: token, useFactory: () => merge(labels()) };
  }

  return { provide: token, useValue: merge(labels) };
}

/**
 * Reads a labels token as one signal, whether it holds a plain object or a live signal.
 * ```ts
 * protected readonly _labels = _injectMudLabels(MUD_TIME_LABELS);
 * ```
 */
export function _injectMudLabels<T>(token: InjectionToken<T | Signal<T>>): Signal<T> {
  const source = inject(token);

  return computed(() => (isSignal(source) ? source() : source));
}
