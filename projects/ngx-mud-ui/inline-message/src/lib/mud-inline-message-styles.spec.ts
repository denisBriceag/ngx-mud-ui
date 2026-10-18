import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudInlineMessage } from './mud-inline-message.component';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

describe('inline message styles', () => {
  it('the component carries its own CSS', () => {
    @Component({ imports: [MudInlineMessage], template: `<mud-inline-message>Saved</mud-inline-message>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.inline-message\s*\{/);
  });
});
