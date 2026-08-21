import { TestBed } from '@angular/core/testing';
import { MudIconRegistry } from './mud-icon-registry.service';
import type { MudIcon } from './types';

const alarm: MudIcon = {
  name: 'alarm',
  variants: { outlined: { 24: { viewBox: '0 0 25 24', body: '<path/>' } } },
};

describe('MudIconRegistry', () => {
  let registry: MudIconRegistry;

  beforeEach(() => { registry = TestBed.inject(MudIconRegistry); });

  it('returns undefined for an unregistered icon', () => {
    expect(registry.get('alarm')).toBeUndefined();
  });

  it('registers and retrieves an icon by name', () => {
    registry.register([alarm]);
    expect(registry.get('alarm')).toEqual(alarm);
  });

  it('merges across multiple register calls and overwrites by name', () => {
    registry.register([alarm]);
    const alarm2: MudIcon = { name: 'alarm', variants: { filled: { 24: { viewBox: '0 0 24 24', body: '<rect/>' } } } };

    registry.register([alarm2]);
    expect(registry.get('alarm')).toEqual(alarm2);
  });
});
