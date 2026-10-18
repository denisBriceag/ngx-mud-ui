import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  effect,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { MudSidebar } from './mud-sidebar.component';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudSidebarStyles } from './mud-sidebar-styles.component';

declare const ngDevMode: boolean | undefined;

/**
 * ```html
 * <main mudSidebarContent>…</main>
 * ```
 */
@Directive({
  selector: '[mudSidebarContent]',
  host: { class: 'mud-sidebar-layout__content' },
})
export class MudSidebarContent {}

/**
 * ```html
 * <mud-sidebar-layout>
 *   <mud-sidebar aria-label="Împuterniciri">…</mud-sidebar>
 *   <main mudSidebarContent>…</main>
 * </mud-sidebar-layout>
 * ```
 */
@Component({
  selector: 'mud-sidebar-layout',
  exportAs: 'mudSidebarLayout',
  template: `<ng-content select="mud-sidebar" /><ng-content />`,
  host: {
    class: 'mud-sidebar-layout',
    '[class.mud-sidebar-layout--compact]': '!!_sidebar()?.compact()',
    '[class.mud-sidebar-layout--no-sidebar]': '!_sidebar()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MudSidebarLayout {
  private readonly _sidebars = contentChildren(MudSidebar);

  protected readonly _sidebar = computed(() => this._sidebars()[0] ?? null);

  constructor() {
    inject(MudStyleLoader).load(_MudSidebarStyles);

    effect(() => {
      if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._sidebars().length > 1) {
        console.warn('mud-sidebar-layout: only one mud-sidebar is laid out; the first one wins.');
      }
    });
  }
}
