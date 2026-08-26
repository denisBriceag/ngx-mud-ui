export interface MudPhoneCountry {
  /** ISO 3166-1 alpha-2 (`MD`, `RO`, …). */
  readonly iso: string;
  /** International dial code, leading `+` included (`+373`). */
  readonly dialCode: string;
  /**
   * Fallback label and search term, in English.
   */
  readonly name: string;
  readonly aliases?: readonly string[];
  /**
   * National-segment format: `X` marks a digit, everything else is a literal
   * separator.
   */
  readonly mask: string;
  /** Inclusive minimum national-segment digit count. */
  readonly minDigits: number;
  /** Inclusive maximum national-segment digit count. */
  readonly maxDigits: number;
  /**
   * Flag image for this country, as a URL or data URI. Only needed for
   * countries you supply yourself.
   */
  readonly flag?: string;
}

export function validateCountry(country: MudPhoneCountry): string[] {
  const problems: string[] = [];

  if (!/^\+\d+$/.test(country.dialCode)) {
    problems.push(`dialCode "${country.dialCode}" should be a "+" followed by digits`);
  }

  if (country.minDigits > country.maxDigits) {
    problems.push(`minDigits (${country.minDigits}) is greater than maxDigits (${country.maxDigits})`);
  }

  const slots = country.mask.replace(/[^X]/g, '').length;

  if (slots !== country.maxDigits) {
    problems.push(`mask "${country.mask}" holds ${slots} digits but maxDigits is ${country.maxDigits}`);
  }

  return problems;
}

/**
 * The curated Moldova-diaspora list the official component ships, in its
 * original order - Moldova first, then the countries with the largest
 * Moldovan communities.
 */
export const MUD_PHONE_COUNTRIES: readonly MudPhoneCountry[] = [
  { iso: 'MD', dialCode: '+373', name: 'Moldova', mask: 'XXX XX XXX', minDigits: 8, maxDigits: 8 },
  { iso: 'RO', dialCode: '+40', name: 'Romania', mask: 'XXX XXX XXX', minDigits: 9, maxDigits: 9 },
  { iso: 'RU', dialCode: '+7', name: 'Russia', mask: 'XXX XXX XX XX', minDigits: 10, maxDigits: 10 },
  { iso: 'UA', dialCode: '+380', name: 'Ukraine', mask: 'XX XXX XX XX', minDigits: 9, maxDigits: 9 },
  { iso: 'US', dialCode: '+1', name: 'United States', mask: 'XXX XXX XXXX', minDigits: 10, maxDigits: 10 },
  { iso: 'GB', dialCode: '+44', name: 'United Kingdom', mask: 'XXXX XXX XXX', minDigits: 10, maxDigits: 10 },
  { iso: 'DE', dialCode: '+49', name: 'Germany', mask: 'XXX XXXX XXXX', minDigits: 10, maxDigits: 11 },
  { iso: 'FR', dialCode: '+33', name: 'France', mask: 'X XX XX XX XX', minDigits: 9, maxDigits: 9 },
  { iso: 'IT', dialCode: '+39', name: 'Italy', mask: 'XXX XXX XXXX', minDigits: 9, maxDigits: 10 },
  { iso: 'ES', dialCode: '+34', name: 'Spain', mask: 'XXX XXX XXX', minDigits: 9, maxDigits: 9 },
  { iso: 'PT', dialCode: '+351', name: 'Portugal', mask: 'XXX XXX XXX', minDigits: 9, maxDigits: 9 },
  { iso: 'IL', dialCode: '+972', name: 'Israel', mask: 'XX XXX XXXX', minDigits: 9, maxDigits: 9 },
  { iso: 'TR', dialCode: '+90', name: 'Turkey', mask: 'XXX XXX XX XX', minDigits: 10, maxDigits: 10 },
  { iso: 'BG', dialCode: '+359', name: 'Bulgaria', mask: 'XX XXX XXXX', minDigits: 8, maxDigits: 9 },
  { iso: 'GR', dialCode: '+30', name: 'Greece', mask: 'XXX XXX XXXX', minDigits: 10, maxDigits: 10 },
];

/** Fallback country. */
export const MUD_PHONE_DEFAULT_ISO = 'MD';

const BY_ISO = new Map(MUD_PHONE_COUNTRIES.map((country) => [country.iso, country]));

/** Looks up a country by ISO code; undefined when the code is not in the table. */
export function findCountry(iso: string | undefined): MudPhoneCountry | undefined {
  return iso ? BY_ISO.get(iso.toUpperCase()) : undefined;
}

/**
 * Resolves the country whose dial code an E.164 number starts with, preferring
 * the LONGEST match so `+373…` never resolves as `+3` and `+1…` does not
 * swallow `+1…` neighbors.
 */
export function findCountryByDialCode(
  e164: string,
  within: readonly MudPhoneCountry[] = MUD_PHONE_COUNTRIES,
): MudPhoneCountry | undefined {
  const digits = e164.replace(/\D/g, '');

  if (!digits) return undefined;

  let match: MudPhoneCountry | undefined;

  for (const country of within) {
    const code = country.dialCode.replace(/\D/g, '');

    if (!digits.startsWith(code)) continue;

    if (!match || code.length > match.dialCode.replace(/\D/g, '').length) match = country;
  }

  return match;
}
