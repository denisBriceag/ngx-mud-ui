import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudRadio, MudRadioGroup } from '../public-api';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

describe('radio styles', () => {
  it('a lone radio group loads the selection-control CSS (no checkbox on the page)', () => {
    @Component({ imports: [MudRadio, MudRadioGroup], template: `<mud-radio-group><mud-radio value="a">A</mud-radio></mud-radio-group>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.selection-control\s*\{/);
  });
});
