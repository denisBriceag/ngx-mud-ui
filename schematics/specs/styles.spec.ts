import { describe, expect, it } from 'vitest';

import { libraryStyles, mergeLibraryStyles, testTargetPolicy } from '../ng-add/styles';

const OVERLAY = '@angular/cdk/overlay-prebuilt.css';
const MUD = 'ngx-mud-ui/prebuilt/mud.css';
const DARK = 'ngx-mud-ui/prebuilt/mud-dark.css';

describe('libraryStyles', () => {
  it('lists overlay then mud, plus dark when asked', () => {
    expect(libraryStyles(false)).toEqual([OVERLAY, MUD]);
    expect(libraryStyles(true)).toEqual([OVERLAY, MUD, DARK]);
  });
});

describe('mergeLibraryStyles', () => {
  it('puts the library entries before the app stylesheet', () => {
    expect(mergeLibraryStyles(['src/styles.scss'], libraryStyles(false))).toEqual({
      styles: [OVERLAY, MUD, 'src/styles.scss'],
      added: [OVERLAY, MUD],
    });
  });

  it('inserts the dark sheet right after mud.css on a rerun', () => {
    expect(mergeLibraryStyles([OVERLAY, MUD, 'src/styles.scss'], libraryStyles(true))).toEqual({
      styles: [OVERLAY, MUD, DARK, 'src/styles.scss'],
      added: [DARK],
    });
  });

  it('changes nothing when everything is already there', () => {
    const styles = [OVERLAY, MUD, DARK, 'src/styles.scss'];

    expect(mergeLibraryStyles(styles, libraryStyles(true))).toEqual({ styles, added: [] });
  });

  it('treats node_modules paths from a manual setup as present', () => {
    const styles = ['./node_modules/@angular/cdk/overlay-prebuilt.css', 'node_modules/ngx-mud-ui/prebuilt/mud.css', 'src/styles.scss'];

    expect(mergeLibraryStyles(styles, libraryStyles(false))).toEqual({ styles, added: [] });
  });

  it('matches object entries by input and leaves them untouched', () => {
    const entry = { input: 'node_modules/ngx-mud-ui/prebuilt/mud.css', inject: true };

    expect(mergeLibraryStyles([entry, 'src/styles.scss'], libraryStyles(false))).toEqual({
      styles: [OVERLAY, entry, 'src/styles.scss'],
      added: [OVERLAY],
    });
  });
});

describe('testTargetPolicy', () => {
  it('adds styles for karma builders only', () => {
    expect(testTargetPolicy('@angular/build:karma')).toBe('add');
    expect(testTargetPolicy('@angular-devkit/build-angular:karma')).toBe('add');
    expect(testTargetPolicy('@angular/build:unit-test')).toBe('covered');
    expect(testTargetPolicy(undefined)).toBe('skip');
  });
});
