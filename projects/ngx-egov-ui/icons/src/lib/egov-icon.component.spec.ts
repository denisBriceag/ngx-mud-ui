import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EgovIconComponent } from './egov-icon.component';
import { provideEgovIcons } from './provide-egov-icons';
import type { EgovIcon } from './types';
import type { EgovIconName } from './icon-name';

const star: EgovIcon = {
  name: 'bookmark',
  variants: {
    outlined: {
      24: { viewBox: '0 0 25 24', body: '<path d="M1 2" fill="currentColor"/>' },
      16: { viewBox: '0 0 17 16', body: '<path d="M3 4" fill="currentColor"/>' },
    },
    filled: { 24: { viewBox: '0 0 24 24', body: '<rect fill="currentColor"/>' } },
  },
};

@Component({ imports: [EgovIconComponent], template: `<egov-icon [name]="n" [variant]="v" [scale]="s" />` })
class Host { n: EgovIconName = 'bookmark'; v: 'outlined' | 'filled' = 'outlined'; s: 12 | 16 | 20 | 24 = 24; }

function render() {
  TestBed.configureTestingModule({ imports: [Host], providers: [provideEgovIcons([star])] });

  return TestBed.createComponent(Host);
}

describe('EgovIconComponent (rendering)', () => {
  it('renders the svg for the requested variant+scale with its viewBox and size', async () => {
    const fixture = render();

    await fixture.whenStable();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    expect(svg).toBeTruthy();
    expect(svg.getAttribute('viewBox')).toBe('0 0 25 24');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
    expect(svg.innerHTML).toContain('M1 2');
  });

  it('applies fill=currentColor so icons inherit color', async () => {
    const fixture = render();

    await fixture.whenStable();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    expect(svg.getAttribute('fill')).toBe('currentColor');
  });

  it('switches geometry when scale changes', async () => {
    const fixture = render();

    fixture.componentInstance.s = 16;
    await fixture.whenStable();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    expect(svg.getAttribute('viewBox')).toBe('0 0 17 16');
    expect(svg.getAttribute('width')).toBe('16');
  });
});

const circleOutlineOnly: EgovIcon = {
  name: 'flag',
  variants: {
    outlined: { 24: { viewBox: '0 0 30 30', body: '<circle r="10" fill="currentColor"/>' } },
  },
};

const smallScaleOnly: EgovIcon = {
  name: 'search',
  variants: {
    outlined: { 16: { viewBox: '0 0 18 16', body: '<path d="M5 6" fill="currentColor"/>' } },
  },
};

const filledOnlyNoOutlined: EgovIcon = {
  name: 'menu',
  variants: {
    filled: { 24: { viewBox: '0 0 40 40', body: '<rect fill="currentColor"/>' } },
  },
};

describe('EgovIconComponent (fallback + a11y)', () => {
  it('falls back to the nearest larger scale when the exact one is missing', async () => {
    const fixture = render(); // star has scales 24 & 16 for outlined

    fixture.componentInstance.s = 20; // 20 missing -> nearest larger is 24
    await fixture.whenStable();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    expect(svg.getAttribute('viewBox')).toBe('0 0 25 24');
  });

  it('falls back to outlined when the requested variant is missing', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [Host], providers: [provideEgovIcons([star, circleOutlineOnly])] });
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.n = 'flag'; // flag (circleOutlineOnly) has no "filled" variant
    fixture.componentInstance.v = 'filled';
    fixture.componentInstance.s = 24;
    await fixture.whenStable();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    expect(svg.getAttribute('viewBox')).toBe('0 0 30 30');
  });

  it('falls back to a smaller scale when no larger one is available', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [Host], providers: [provideEgovIcons([smallScaleOnly])] });
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.n = 'search'; // smallScaleOnly only has outlined@16
    fixture.componentInstance.v = 'outlined';
    fixture.componentInstance.s = 24; // requested 24 has no larger scale to fall back to
    await fixture.whenStable();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    expect(svg.getAttribute('viewBox')).toBe('0 0 18 16');
  });

  it('falls back to the first available variant when neither the requested variant nor "outlined" exists', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [Host], providers: [provideEgovIcons([filledOnlyNoOutlined])] });
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.n = 'menu'; // filledOnlyNoOutlined has only "filled", no "outlined"
    fixture.componentInstance.v = 'outlined'; // default; neither "outlined" nor a fallback to it exists
    fixture.componentInstance.s = 24;
    await fixture.whenStable();
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    expect(svg.getAttribute('viewBox')).toBe('0 0 40 40');
  });

  it('is decorative (aria-hidden) with no aria-label', async () => {
    const fixture = render();

    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('egov-icon');

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('is semantic (role=img + aria-label) when aria-label is set', async () => {
    TestBed.resetTestingModule();
    @Component({ imports: [EgovIconComponent], template: `<egov-icon name="bookmark" aria-label="Star" />` })
    class LabelledHost {}
    TestBed.configureTestingModule({ imports: [LabelledHost], providers: [provideEgovIcons([star])] });
    const fixture = TestBed.createComponent(LabelledHost);

    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('egov-icon');

    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Star');
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });

  it('is decorative (aria-hidden, no role, no aria-label) when aria-label is empty/whitespace-only', async () => {
    TestBed.resetTestingModule();

    @Component({ imports: [EgovIconComponent], template: `<egov-icon name="bookmark" aria-label="   " />` })
    class BlankLabelHost {}

    TestBed.configureTestingModule({ imports: [BlankLabelHost], providers: [provideEgovIcons([star])] });

    const fixture = TestBed.createComponent(BlankLabelHost);

    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('egov-icon');

    expect(host.getAttribute('role')).toBeNull();
    expect(host.getAttribute('aria-label')).toBeNull();
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });
});
