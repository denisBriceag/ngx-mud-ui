import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudCornerBadge } from './mud-corner-badge.directive';

const badgeCss = () =>
  [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').filter((t) => t.includes('.badge')).join('\n');

describe('badge styles', () => {
  it('the directive brings the badge CSS', () => {
    @Component({ imports: [MudCornerBadge], template: `<button mudBadge="3">Inbox</button>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(badgeCss()).toMatch(/\.badge\s*\{/);
  });
});
