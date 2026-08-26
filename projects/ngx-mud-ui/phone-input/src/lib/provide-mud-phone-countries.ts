import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import type { MudPhoneCountry } from './phone-countries';

/**
 * App-wide country list for `mud-phone-input`, as supplied by
 * {@link provideMudPhoneCountries}. A field's own `countries` input takes
 * precedence over this.
 *
 * @docs-private Configure it through the provider rather than injecting the
 * token yourself.
 */
export const MUD_PHONE_COUNTRIES_CONFIG = new InjectionToken<
  readonly (string | MudPhoneCountry)[]
>('MUD_PHONE_COUNTRIES_CONFIG');

/**
 * Sets the country list for `mud-phone-input`
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
 *
 * A single field can still opt out by setting its own `countries`.
 */
export function provideMudPhoneCountries(
  countries: readonly (string | MudPhoneCountry)[],
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MUD_PHONE_COUNTRIES_CONFIG, useValue: countries },
  ]);
}
