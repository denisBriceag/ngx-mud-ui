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

  it('ships group heading and rule styles shared with the menu', () => {
    @Component({ imports: [MudSelectInput], template: `<mud-select-input [options]="[]" />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    expect(css()).toMatch(
      /\.menu-panel__group-heading\s*\{[^}]*color:\s*var\(--mud-color-text-base-tertiary\)/,
    );
    expect(css()).toMatch(/\.menu-panel__group:first-child::before\s*\{[^}]*display:\s*none/);
    // A border, not a background: forced-colors mode erases backgrounds but keeps borders.
    expect(css()).toMatch(
      /\.menu-panel__group::before\s*\{[^}]*border-block-start:\s*1px solid var\(--mud-color-border-base-default\)/,
    );
  });
});
