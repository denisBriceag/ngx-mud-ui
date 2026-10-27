import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import type { MudPhoneCountry } from './phone-countries';

/** @docs-private App-wide country list from {@link provideMudPhoneCountries}; a field's `countries` input wins. */
export const MUD_PHONE_COUNTRIES_CONFIG = new InjectionToken<
  readonly (string | MudPhoneCountry)[]
>('MUD_PHONE_COUNTRIES_CONFIG');

/**
 * Sets the app-wide country list for `mud-phone-input`.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [
 *     provideMudPhoneCountries([
 *       'MD',
 *       'RO',
 *       { iso: 'PL', dialCode: '+48', name: 'Poland',
 *         mask: 'XXX XXX XXX', minDigits: 9, maxDigits: 9 },
 *     ]),
 *   ],
 * });
 * ```
 */
export function provideMudPhoneCountries(
  countries: readonly (string | MudPhoneCountry)[],
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MUD_PHONE_COUNTRIES_CONFIG, useValue: countries },
  ]);
}
