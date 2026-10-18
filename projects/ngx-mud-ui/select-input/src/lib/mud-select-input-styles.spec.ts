import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudSelectInput } from './mud-select-input.component';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

describe('select styles', () => {
  it('a select loads the menu-panel CSS for its listbox', () => {
    @Component({ imports: [MudSelectInput], template: `<mud-select-input [options]="[]" />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.menu-panel\s*\{/);
  });
});
