import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDatePicker } from './mud-date-picker.component';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

describe('date picker styles', () => {
  it('an inline calendar alone loads the input-field CSS (it renders .input-field__sr-only)', () => {
    @Component({ imports: [MudDatePicker], template: `<mud-date-picker />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.input-field__sr-only\s*\{/);
  });
});
