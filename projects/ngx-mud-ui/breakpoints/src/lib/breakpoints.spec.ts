import { MudBreakpoints, MudBreakpointValues } from './breakpoints';

describe('MudBreakpoints', () => {
  it('exposes the official breakpoint values', () => {
    expect(MudBreakpointValues).toEqual({ Xs: 320, Sm: 576, Md: 768, Lg: 992, Xl: 1248, Xxl: 1440 });
  });

  it('exposes min-width queries for CDK BreakpointObserver', () => {
    expect(MudBreakpoints.Md).toBe('(min-width: 768px)');
    expect(Object.keys(MudBreakpoints)).toEqual(Object.keys(MudBreakpointValues));
  });
});
