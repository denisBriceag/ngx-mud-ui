import { describe, expect, it } from 'vitest';

import { missingPeers } from '../ng-add/peers';

const PEERS = { '@angular/cdk': '^22.2.0', '@angular/core': '^22.2.0' };

describe('missingPeers', () => {
  it('returns the peers the app does not list', () => {
    expect(missingPeers(PEERS, { dependencies: { '@angular/core': '22.2.2' } })).toEqual({ '@angular/cdk': '^22.2.0' });
  });

  it('counts a peer listed only in devDependencies as installed', () => {
    expect(missingPeers(PEERS, { dependencies: { '@angular/core': '22.2.2' }, devDependencies: { '@angular/cdk': '22.2.2' } })).toEqual({});
  });

  it('never touches a peer installed at another version', () => {
    expect(missingPeers(PEERS, { dependencies: { '@angular/core': '21.0.0', '@angular/cdk': '21.0.0' } })).toEqual({});
  });
});
