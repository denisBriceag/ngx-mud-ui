import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDialog } from 'ngx-mud-ui/dialog';
import { MudDrawer } from 'ngx-mud-ui/drawer';
import { MudToast } from 'ngx-mud-ui/toast';
import { MudMenu } from './mud-menu.component';
import { MudMegaMenu } from './mud-mega-menu.component';
import { MudMegaMenuTrigger } from './mud-mega-menu-trigger.component';

// Overlay components bring their CSS themselves — no global stylesheet in jsdom.
const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
const styled = (root: string) => new RegExp(`\\.${root}\\s*\\{`);

@Component({ template: `<p>Body</p>` })
class Body {}

describe('overlay component styles', () => {
  it('menu', () => {
    @Component({ imports: [MudMenu], template: `<mud-menu />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('menu'));
  });

  it('mega menu', () => {
    @Component({
      imports: [MudMegaMenu, MudMegaMenuTrigger],
      template: `<button [mudMegaMenuTriggerFor]="m">Servicii</button><mud-mega-menu #m aria-label="Servicii" />`,
    })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('mega-menu-trigger'));
  });

  it('dialog', async () => {
    TestBed.inject(MudDialog).open(Body);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(css()).toMatch(styled('dialog'));
  });

  it('drawer', async () => {
    TestBed.inject(MudDrawer).open(Body);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(css()).toMatch(styled('drawer'));
  });

  it('toast', async () => {
    TestBed.inject(MudToast).open({ data: { message: 'Saved' }, duration: 0 });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(css()).toMatch(styled('mud-toast'));
  });
});
