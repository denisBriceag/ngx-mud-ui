import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudAccordion } from 'ngx-mud-ui/accordion';
import { MudAvatar } from 'ngx-mud-ui/avatar';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudBreadcrumb } from 'ngx-mud-ui/breadcrumb';
import { MudInfoBox } from 'ngx-mud-ui/info-box';
import { MudPagination } from 'ngx-mud-ui/pagination';
import { MudSpinner } from 'ngx-mud-ui/spinner';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';
import { MudCell, MudCellDef, MudColumnDef, MudHeaderCell, MudHeaderCellDef, MudHeaderRow, MudHeaderRowDef, MudRow, MudRowDef, MudTable } from 'ngx-mud-ui/table';
import { MudTree } from 'ngx-mud-ui/tree';
import { MudTreeItem } from 'ngx-mud-ui/tree-item';
import { MudSidebarLayout } from './mud-sidebar-layout.component';

// Each display component carries its CSS — including the pieces that can render on their own.
const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');
const styled = (root: string) => new RegExp(`\\.${root}\\s*\\{`);

describe('display component styles', () => {
  it('accordion item alone', () => {
    @Component({ imports: [MudAccordion], template: `<mud-accordion />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('accordion__item'));
  });

  it('avatar', () => {
    @Component({ imports: [MudAvatar], template: `<mud-avatar>AB</mud-avatar>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('avatar'));
  });

  it('banner', () => {
    @Component({ imports: [MudBanner], template: `<mud-banner>Notice</mud-banner>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('banner'));
  });

  it('breadcrumb', () => {
    @Component({ imports: [MudBreadcrumb], template: `<nav mudBreadcrumb aria-label="Breadcrumb"><ol></ol></nav>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('mud-breadcrumb'));
  });

  it('info box', () => {
    @Component({ imports: [MudInfoBox], template: `<mud-info-box>Info</mud-info-box>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('info-box'));
  });

  it('pagination', () => {
    @Component({ imports: [MudPagination], template: `<mud-pagination [length]="10" />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('mud-pagination'));
  });

  it('spinner', () => {
    @Component({ imports: [MudSpinner], template: `<mud-spinner />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('spinner'));
  });

  it('stepper', () => {
    @Component({ imports: [MudStepper, MudStep], template: `<mud-stepper><mud-step label="A">a</mud-step></mud-stepper>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('stepper'));
  });

  it('table', () => {
    @Component({
      imports: [MudTable, MudColumnDef, MudHeaderCellDef, MudCellDef, MudHeaderCell, MudCell, MudHeaderRowDef, MudRowDef, MudHeaderRow, MudRow],
      template: `<table mud-table [dataSource]="[]">
        <ng-container mudColumnDef="a"><th mud-header-cell *mudHeaderCellDef>A</th><td mud-cell *mudCellDef="let r">{{ r }}</td></ng-container>
        <tr mud-header-row *mudHeaderRowDef="['a']"></tr><tr mud-row *mudRowDef="let r; columns: ['a']"></tr>
      </table>`,
    })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('mud-data-table'));
  });

  it('tree item alone', () => {
    @Component({ imports: [MudTreeItem], template: `<a mud-tree-item href="#">Home</a>` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('mud-tree-item'));
  });

  it('tree alone (its nodes render tree-item rows)', () => {
    @Component({ imports: [MudTree], template: `<mud-tree [dataSource]="[]" [childrenAccessor]="noKids" />` })
    class Host {
      protected readonly noKids = () => [];
    }

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('mud-tree'));
  });

  it('sidebar layout alone', () => {
    @Component({ imports: [MudSidebarLayout], template: `<mud-sidebar-layout />` })
    class Host {}

    TestBed.createComponent(Host).detectChanges();
    expect(css()).toMatch(styled('mud-sidebar-layout'));
  });
});
