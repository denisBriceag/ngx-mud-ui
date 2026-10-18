/**
 * The sheet's rules with `@layer { … }` blocks expanded in place — the base CSS (tokens) lives in
 * the `mud.base` layer, and a plain `sheet.cssRules` walk only sees the layer wrapper.
 * Other grouping rules (`@media`, `@supports`) are left as-is, as before.
 */
export function unlayeredRules(rules: CSSRuleList): CSSRule[] {
  return Array.from(rules).flatMap((rule) =>
    rule instanceof CSSLayerBlockRule ? unlayeredRules(rule.cssRules) : [rule],
  );
}
