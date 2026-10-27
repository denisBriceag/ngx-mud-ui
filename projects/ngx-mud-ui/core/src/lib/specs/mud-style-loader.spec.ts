import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudStyleLoader } from '../mud-style-loader';

// Two throw-away style hosts: empty components whose only payload is a global stylesheet.
@Component({
  selector: 'mud-spec-styles-a',
  template: '',
  styles: ['.spec-style-loader-a { color: rgb(1, 2, 3); }'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StylesA {}

@Component({
  selector: 'mud-spec-styles-b',
  template: '',
  styles: ['.spec-style-loader-b { color: rgb(4, 5, 6); }'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StylesB {}

const styleTags = (marker: string) =>
  [...document.querySelectorAll('style')].filter((s) => (s.textContent ?? '').includes(marker));

describe('MudStyleLoader', () => {
  it('injects a style host once, however often it is asked', () => {
    const loader = TestBed.inject(MudStyleLoader);

    loader.load(StylesA);
    loader.load(StylesA);
    loader.load(StylesA);

    expect(styleTags('.spec-style-loader-a')).toHaveLength(1);
  });

  it('keeps hosts independent', () => {
    const loader = TestBed.inject(MudStyleLoader);

    loader.load(StylesA);
    expect(styleTags('.spec-style-loader-b')).toHaveLength(0);

    loader.load(StylesB);
    expect(styleTags('.spec-style-loader-a')).toHaveLength(1);
    expect(styleTags('.spec-style-loader-b')).toHaveLength(1);
  });

  it('removes the styles when the application is destroyed', () => {
    TestBed.inject(MudStyleLoader).load(StylesA);
    expect(styleTags('.spec-style-loader-a')).toHaveLength(1);

    TestBed.resetTestingModule();

    expect(styleTags('.spec-style-loader-a')).toHaveLength(0);
  });

  it('loads again for a fresh application', () => {
    TestBed.inject(MudStyleLoader).load(StylesA);
    TestBed.resetTestingModule();

    TestBed.inject(MudStyleLoader).load(StylesA);

    expect(styleTags('.spec-style-loader-a')).toHaveLength(1);
  });
});
