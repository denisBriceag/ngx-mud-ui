import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudLink } from './mud-link.directive';

const linkCss = () =>
  [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').filter((t) => t.includes('.link')).join('\n');

describe('link styles', () => {
  it('the directive brings the link CSS', () => {
    @Component({ imports: [MudLink], template: `<a mudLink href="#">Docs</a>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(linkCss()).toMatch(/\.link\s*\{/);
  });
});
