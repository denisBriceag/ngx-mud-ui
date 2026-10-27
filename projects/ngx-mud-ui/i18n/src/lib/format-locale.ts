import { computed, inject, InjectionToken, isSignal, LOCALE_ID, signal } from '@angular/core';
import type { Provider, Signal } from '@angular/core';

/** A locale tag, a signal of one, or a factory returning either. */
export type MudFormatLocaleInput = string | Signal<string> | (() => string | Signal<string>);

/** @docs-private The live formatting locale of the current injector. */
export const MUD_FORMAT_LOCALE = new InjectionToken<Signal<string>>('MUD_FORMAT_LOCALE', {
  providedIn: 'root',
  factory: () => {
    const id = inject(LOCALE_ID);

    return signal(_safeLocale(id)).asReadonly();
  },
});

function isValid(tag: string | null | undefined): tag is string {
  if (!tag || tag.trim() === '') return false;

  // Well-formed alone is not enough ('xx-INVALID' parses); the runtime must also know the language.
  try {
    Intl.getCanonicalLocales(tag);

    return Intl.DateTimeFormat.supportedLocalesOf([tag]).length > 0;
  } catch {
    return false;
  }
}

/** @docs-private A valid BCP 47 tag: `tag`, else `fallback`, else 'en-US'. */
export function _safeLocale(tag: string | null | undefined, fallback?: string): string {
  if (isValid(tag)) return tag;

  if (isValid(fallback)) return fallback;

  return 'en-US';
}

/**
 * Sets the locale used for dates, numbers and country names; defaults to `LOCALE_ID`.
 * ```ts
 * providers: [provideMudFormatLocale('ro-MD')]
 * ```
 */
export function provideMudFormatLocale(locale: MudFormatLocaleInput): Provider {
  return {
    provide: MUD_FORMAT_LOCALE,
    useFactory: (): Signal<string> => {
      const parent = inject(MUD_FORMAT_LOCALE, { skipSelf: true, optional: true });
      const localeId = inject(LOCALE_ID);
      const value = typeof locale === 'function' && !isSignal(locale) ? locale() : locale;

      return computed(() => _safeLocale(isSignal(value) ? value() : value, parent?.() ?? localeId));
    },
  };
}

/** Reads the formatting locale in effect as one signal. */
export function injectMudFormatLocale(): Signal<string> {
  return inject(MUD_FORMAT_LOCALE);
}
