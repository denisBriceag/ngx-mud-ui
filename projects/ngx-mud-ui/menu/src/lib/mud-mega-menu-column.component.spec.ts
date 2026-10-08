import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudMegaMenuColumn } from './mud-mega-menu-column.component';
import { MudMegaMenuLink } from './mud-mega-menu-link.directive';
import { MudMegaMenu } from './mud-mega-menu.component';

@Component({
  imports: [MudMegaMenuColumn, MudMegaMenuLink],
  template: `
    <mud-mega-menu-column heading="Servicii">
      <a mudMegaMenuLink href="#one">One</a>
      <a mudMegaMenuLink href="#two">Two</a>
    </mud-mega-menu-column>
  `,
})
class ColumnHost {}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink],
  template: `
    <mud-mega-menu aria-label="Servicii">
      <mud-mega-menu-column heading="H"><a mudMegaMenuLink href="#one">One</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class PanelHost {}

describe('MudMegaMenuColumn + MudMegaMenuLink', () => {
  it('renders an h3 heading, a hidden separator, and the projected links in a plain list', async () => {
    const fixture = TestBed.createComponent(ColumnHost);

    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const column = el.querySelector('mud-mega-menu-column')!;

    expect(column.classList.contains('mega-menu__column')).toBe(true);
    expect(el.querySelector('h3.mega-menu__heading')?.textContent?.trim()).toBe('Servicii');
    expect(el.querySelector('.mega-menu__separator')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('ul, ol')).toBeNull();

    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.mega-menu__links > a'));

    expect(links.map((a) => a.textContent?.trim())).toEqual(['One', 'Two']);
    expect(links.every((a) => a.classList.contains('mega-menu__link'))).toBe(true);
  });

  it('a mega menu without a trigger renders nothing in place', async () => {
    const fixture = TestBed.createComponent(PanelHost);

    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.mega-menu')).toBeNull();
    expect(el.querySelector('mud-mega-menu-column')).toBeNull(); // content lives in the unattached template
  });
});
