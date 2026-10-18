import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTextInput } from './mud-text-input.component';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

describe('text input styles', () => {
  it('a text input loads the input-field CSS', () => {
    @Component({ imports: [MudTextInput], template: `<mud-text-input />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.input-field\s*\{/);
  });
});
