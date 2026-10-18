import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudSwitch } from './mud-switch.component';

const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

describe('switch styles', () => {
  it('a switch loads the selection-control CSS (it styles .switch-control)', () => {
    @Component({ imports: [MudSwitch], template: `<mud-switch>Wi-Fi</mud-switch>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(/\.switch-control\s*\{/);
  });
});
