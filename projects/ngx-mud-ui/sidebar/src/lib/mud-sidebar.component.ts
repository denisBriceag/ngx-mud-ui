import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MudTooltip } from 'ngx-mud-ui/tooltip';
import { MUD_SIDEBAR, MUD_SIDEBAR_GROUP_HOST, type MudSidebarGroupHost } from './mud-sidebar-context';
import { MudSidebarGroup } from './mud-sidebar-group.component';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudSidebarStyles } from './mud-sidebar-styles.component';

declare const ngDevMode: boolean | undefined;

let nextId = 0;

/** Matches the layout's stacking breakpoint in `_sidebar.scss`. */
const NARROW_QUERY = '(max-width: 767.98px)';

/** Keys the tree key manager answers by moving focus (typeahead is any single printable character). */
const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End']);

/**
 * ```html
 * <div mudSidebarHeader>…profile, toggle, main action…</div>
 * ```
 */
@Directive({
  selector: '[mudSidebarHeader]',
  host: { class: 'mud-sidebar-header' },
})
export class MudSidebarHeader {}

/**
 * ```html
 * <mud-sidebar #sb="mudSidebar" aria-label="Împuterniciri" [(collapsed)]="collapsed">
 *   <div mudSidebarHeader>…</div>
 *   <mud-sidebar-group heading="Filtrare">…rows…</mud-sidebar-group>
 * </mud-sidebar>
 * ```
 */
@Component({
  selector: 'mud-sidebar',
  exportAs: 'mudSidebar',
  imports: [MudTooltip],
  template: `<ng-content select="[mudSidebarHeader]" /><ng-content /><span
      class="mud-sidebar__tooltip-anchor"
      mudTooltip
      tooltipTrigger="manual"
      tooltipPlacement="right-center"
      [tooltipDescribesTrigger]="false"
      [tooltipShowDelay]="0"
      [tooltipHideDelay]="0"
    ></span>`,
  host: {
    class: 'mud-sidebar',
    role: 'navigation',
    '[id]': 'id()',
    '[class.mud-sidebar--collapsed]': 'collapsed()',
    '[class.mud-sidebar--compact]': 'compact()',
    '(pointerover)': '_onPointerOver($event)',
    '(pointerleave)': '_hideTooltip()',
    '(focusin)': '_showTooltipFor($event.target)',
    '(focusout)': '_hideTooltip()',
    '(click)': '_onClick($event)',
  },
  providers: [
    { provide: MUD_SIDEBAR, useExisting: MudSidebar },
    { provide: MUD_SIDEBAR_GROUP_HOST, useExisting: MudSidebar },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MudSidebar implements MudSidebarGroupHost {
  private readonly _host: HTMLElement = inject(ElementRef).nativeElement;

  /** @description Icon-only compact rail; two-way bindable. */
  readonly collapsed = model(false);
  private readonly _groups = contentChildren(MudSidebarGroup, { descendants: true });

  private readonly _generatedId = `mud-sidebar-${nextId++}`;

  /** @description Host id; the toggle points aria-controls at it. Blank falls back to a generated id. */
  readonly id = input(this._generatedId, {
    transform: (value: string | undefined) => value?.trim() || this._generatedId,
  });

  /** @description True below 768px, where the layout stacks and the rail is never compact. */
  readonly narrow = toSignal(
    inject(BreakpointObserver)
      .observe(NARROW_QUERY)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  /** @description Collapsed and not narrow, i.e. what is drawn; swap compact content on this. */
  readonly compact = computed(() => this.collapsed() && !this.narrow());

  private readonly _tooltip = viewChild.required(MudTooltip);
  private _tooltipRow: HTMLElement | null = null;

  constructor() {
    inject(MudStyleLoader).load(_MudSidebarStyles);

    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // Capture phase: the tree's own keydown handler (on a descendant) must already see an extended rail.
      const onKeydown = (event: KeyboardEvent) => this._expandBeforeTreeNavigates(event);

      this._host.addEventListener('keydown', onKeydown, true);
      destroyRef.onDestroy(() => this._host.removeEventListener('keydown', onKeydown, true));

      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;

      if (!this._host.hasAttribute('aria-label') && !this._host.hasAttribute('aria-labelledby')) {
        console.warn('mud-sidebar: add an aria-label (or aria-labelledby) so the navigation landmark has a name.');
      }
    });

    effect(() => {
      if (!this.compact()) untracked(() => this._hideTooltip());
    });
  }

  toggle(): void {
    this.collapsed.update((value) => !value);
  }

  /** @internal Used by MudSidebarGroup for the automatic divider. */
  isFirstGroup(group: object): boolean {
    return this._groups()[0] === group;
  }

  protected _onPointerOver(event: PointerEvent): void {
    this._showTooltipFor(event.target);
  }

  /** Compact rows hide their label; one shared tooltip names whichever row has the pointer or focus. */
  protected _showTooltipFor(target: EventTarget | null): void {
    const row = this._rowOf(target);

    if (!this.compact() || !row) {
      this._hideTooltip();

      return;
    }

    // The tooltip can close itself (Escape, outside pointer, scroll), so only skip a row that is still showing.
    if (row === this._tooltipRow && this._tooltip().isOpen) return;

    const label = (row.querySelector('.mud-tree-item__label')?.textContent ?? row.textContent ?? '').trim();
    const tooltip = this._tooltip();

    tooltip.hide();
    tooltip.setAnchor(row);
    tooltip.setContent(label);
    tooltip.show();
    this._tooltipRow = row;
  }

  protected _hideTooltip(): void {
    if (!this._tooltipRow) return;

    this._tooltip().hide();
    this._tooltipRow = null;
  }

  /** In the rail a tree parent cannot show its children, so opening one expands the sidebar first. */
  protected _onClick(event: MouseEvent): void {
    this._hideTooltip();

    if (this.compact() && this._rowOf(event.target)?.matches('.mud-tree-node[aria-expanded]:not([aria-disabled="true"])')) {
      this.collapsed.set(false);
    }
  }

  private _expandBeforeTreeNavigates(event: KeyboardEvent): void {
    if (!this.compact() || event.ctrlKey || event.metaKey || event.altKey) return;

    const row = this._rowOf(event.target);
    const opensRow = (event.key === 'ArrowRight' || event.key === '*') && !!row?.matches('.mud-tree-node[aria-expanded]:not([aria-disabled="true"])');
    const typeahead = event.key.length === 1 && event.key !== ' ';
    const navigatesOpenTree =
      (NAVIGATION_KEYS.has(event.key) || typeahead) &&
      !!row?.closest('.mud-tree')?.querySelector('.mud-tree-node[aria-expanded="true"]');

    if (!opensRow && !navigatesOpenTree) return;

    this.collapsed.set(false);
    this._host.classList.remove('mud-sidebar--compact');
  }

  private _rowOf(target: EventTarget | null): HTMLElement | null {
    const row = target instanceof Element ? target.closest<HTMLElement>('.mud-tree-item') : null;

    return row && this._host.contains(row) ? row : null;
  }
}
