import { TestBed } from '@angular/core/testing';
import { EgovIconRegistry } from './egov-icon-registry.service';
import type { EgovIcon } from './types';

const alarm: EgovIcon = {
  name: 'alarm',
  variants: { outlined: { 24: { viewBox: '0 0 25 24', body: '<path/>' } } },
};

describe('EgovIconRegistry', () => {
  let registry: EgovIconRegistry;

  beforeEach(() => { registry = TestBed.inject(EgovIconRegistry); });

  it('returns undefined for an unregistered icon', () => {
    expect(registry.get('alarm')).toBeUndefined();
  });

  it('registers and retrieves an icon by name', () => {
    registry.register([alarm]);
    expect(registry.get('alarm')).toEqual(alarm);
  });

  it('merges across multiple register calls and overwrites by name', () => {
    registry.register([alarm]);
    const alarm2: EgovIcon = { name: 'alarm', variants: { filled: { 24: { viewBox: '0 0 24 24', body: '<rect/>' } } } };

    registry.register([alarm2]);
    expect(registry.get('alarm')).toEqual(alarm2);
  });
});
