import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDateInput } from './mud-date-input.component';
import { MudDatePicker } from './mud-date-picker.component';
import { MudTimeInput, MudTimePicker } from 'ngx-mud-ui/time-picker';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
const styled = (root: string) => new RegExp(`\\.${root}\\s*\\{`);

describe('date + time component styles', () => {
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

  it('time input', () => {
    @Component({ imports: [MudTimeInput], template: `<mud-time-input />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('time-field__entry'));
  });

  it('time picker', () => {
    @Component({ imports: [MudTimePicker], template: `<mud-time-picker />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('time-picker'));
  });
});
