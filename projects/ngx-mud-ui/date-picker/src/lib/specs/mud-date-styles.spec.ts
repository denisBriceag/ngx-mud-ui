import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDateInput } from '../mud-date-input.component';
import { MudDatePicker } from '../mud-date-picker.component';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
const styled = (root: string) => new RegExp(`\\.${root}\\s*\\{`);

describe('date component styles', () => {
  it('date input', () => {
    @Component({ imports: [MudDateInput], template: `<mud-date-input />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('date-field__entry'));
  });

  it('date picker', () => {
    @Component({ imports: [MudDatePicker], template: `<mud-date-picker />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('date-picker'));
  });

  it('an inline calendar alone loads the input-field CSS (it renders .input-field__sr-only)', () => {
    @Component({ imports: [MudDatePicker], template: `<mud-date-picker />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('input-field__sr-only'));
  });
});
