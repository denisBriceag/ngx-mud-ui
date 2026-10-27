import { computed, inject, InjectionToken, isSignal, signal } from '@angular/core';
import type { Provider, Signal } from '@angular/core';
import { MUD_LABELS_EN } from './mud-labels';
import type { MudLabels, MudLabelsInput, MudLabelsPartial } from './mud-labels';

/** @docs-private The live labels of the current injector. */
export const MUD_LABELS = new InjectionToken<Signal<MudLabels>>('MUD_LABELS', {
  providedIn: 'root',
  factory: () => signal(MUD_LABELS_EN).asReadonly(),
});

// Resolves one input to a signal; a factory runs in the caller's injection context.
function resolve(input: MudLabelsInput): Signal<MudLabelsPartial> {
  const value = typeof input === 'function' && !isSignal(input) ? input() : input;

  return isSignal(value) ? value : signal(value).asReadonly();
}

// Spreads per namespace, so a partial namespace overlays only its own keys.
function merge(base: MudLabels, partials: readonly MudLabelsPartial[]): MudLabels {
  const out: Record<string, object> = { ...base };

  for (const partial of partials) {
    for (const key of Object.keys(partial)) {
      const ns = (partial as Record<string, Record<string, unknown> | undefined>)[key];
      const defined = Object.fromEntries(Object.entries(ns ?? {}).filter(([, v]) => v !== undefined));

      out[key] = { ...out[key], ...defined };
    }
  }

  return out as unknown as MudLabels;
}

/**
 * Overrides labels for this injector; later arguments win, and it merges onto the parent's labels.
 * ```ts
 * providers: [provideMudLabels({ banner: { close: 'Închide' } })]
 * ```
 */
export function provideMudLabels(...labels: MudLabelsInput[]): Provider {
  return {
    provide: MUD_LABELS,
    useFactory: (): Signal<MudLabels> => {
      const parent = inject(MUD_LABELS, { skipSelf: true, optional: true }) ?? signal(MUD_LABELS_EN).asReadonly();
      const inputs = labels.map(resolve);

      return computed(() => merge(parent(), inputs.map((read) => read())));
    },
  };
}

/** Reads the labels in effect as one signal. */
export function injectMudLabels(): Signal<MudLabels> {
  return inject(MUD_LABELS);
}

/** @docs-private Instance override if set (non-blank), else the label. */
export function _mudText<T extends string | ((...args: never[]) => string)>(instance: T | undefined | null, label: T): T {
  if (instance == null) return label;

  if (typeof instance === 'string' && instance.trim() === '') return label;

  return instance;
}
