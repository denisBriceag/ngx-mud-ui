import { TestBed } from '@angular/core/testing';
import { MudIconRegistry } from './mud-icon-registry.service';
import { provideMudIcons } from './provide-mud-icons';
import type { MudIcon } from './types';

const home: MudIcon = {
  name: 'home',
  variants: { outlined: { 24: { viewBox: '0 0 25 24', body: '<path/>' } } },
};

describe('provideMudIcons', () => {
  it('registers provided icons into the registry at init', () => {
    TestBed.configureTestingModule({ providers: [provideMudIcons([home])] });

    const registry = TestBed.inject(MudIconRegistry);

    expect(registry.get('home')).toEqual(home);
  });
});
