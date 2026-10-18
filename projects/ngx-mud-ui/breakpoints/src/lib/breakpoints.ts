/** @description The official MUD breakpoints in px; mirrored by `ngx-mud-ui/breakpoints` Sass. */
export const MudBreakpointValues = {
  Xs: 320,
  Sm: 576,
  Md: 768,
  Lg: 992,
  Xl: 1248,
  Xxl: 1440,
} as const;

export type MudBreakpointName = keyof typeof MudBreakpointValues;

/** @description Min-width media queries for CDK `BreakpointObserver`, e.g. `observe(MudBreakpoints.Md)`. */
export const MudBreakpoints = Object.fromEntries(
  Object.entries(MudBreakpointValues).map(([name, px]) => [name, `(min-width: ${px}px)`]),
) as { readonly [K in MudBreakpointName]: `(min-width: ${(typeof MudBreakpointValues)[K]}px)` };
