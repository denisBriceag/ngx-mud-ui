import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudButton } from './mud-button.directive';
import { MudIconButton } from './mud-icon-button.directive';

// Component CSS ships with the directive (no global stylesheet in jsdom), once per app, unlayered:
// overriding a component takes deliberate specificity; tokens are the supported customization.
const buttonSheets = () => [...document.querySelectorAll('style')].filter((s) => s.textContent?.includes('.mud-btn'));

describe('button styles', () => {
  it('injects the button CSS when the directive is used, outside any cascade layer', () => {
    @Component({ imports: [MudButton], template: `<button mudButton>Go</button>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();

    const css = buttonSheets().map((s) => s.textContent).join('\n');

    expect(css).not.toContain('@layer'); // unlayered: overriding a component takes deliberate specificity
    expect(css).toMatch(/\.mud-btn/);
  });

  it('injects the CSS once, however many buttons render', () => {
    @Component({
      imports: [MudButton, MudIconButton],
      template: `<button mudButton>A</button><button mudButton>B</button><button mudIconButton aria-label="C"></button>`,
    })
    class Many {}

    TestBed.createComponent(Many).detectChanges();
    TestBed.createComponent(Many).detectChanges();

    expect(buttonSheets().length).toBe(1);
  });
});
