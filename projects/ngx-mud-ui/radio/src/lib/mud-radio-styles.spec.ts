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

  it('ships the horizontal options rule: a wrapping row, 24px between options, 12px between lines', () => {
    @Component({ imports: [MudRadio, MudRadioGroup], template: `<mud-radio-group orientation="horizontal"><mud-radio value="a">A</mud-radio></mud-radio-group>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    const rule = css().match(/\.radio-group--horizontal\s+\.radio-group__options\s*\{[^}]*\}/)?.[0] ?? '';

    expect(rule).toContain('flex-direction: row');
    expect(rule).toContain('flex-wrap: wrap');
    expect(rule).toMatch(/column-gap:[^;]*24px/);
  });

  it('keeps the group label in normal text flow, so the required asterisk follows the last word when it wraps', () => {
    @Component({ imports: [MudRadio, MudRadioGroup], template: `<mud-radio-group required><mud-radio value="a">A</mud-radio></mud-radio-group>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    const label = css().match(/\.radio-group__label\s*\{[^}]*\}/)?.[0] ?? '';
    const asterisk = css().match(/\.radio-group__required\s*\{[^}]*\}/)?.[0] ?? '';

    expect(label).not.toMatch(/display:\s*(inline-)?flex/);
    expect(asterisk).toMatch(/margin-left:[^;]*4px/);
  });
});
