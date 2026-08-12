import { TestBed } from '@angular/core/testing';
import { EgovIconRegistry } from './egov-icon-registry.service';
import { provideEgovIcons } from './provide-egov-icons';
import type { EgovIcon } from './types';

const home: EgovIcon = {
  name: 'home',
  variants: { outlined: { 24: { viewBox: '0 0 25 24', body: '<path/>' } } },
};

describe('provideEgovIcons', () => {
  it('registers provided icons into the registry at init', () => {
    TestBed.configureTestingModule({ providers: [provideEgovIcons([home])] });

    const registry = TestBed.inject(EgovIconRegistry);

    expect(registry.get('home')).toEqual(home);
  });
});
