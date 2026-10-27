import { InjectionToken } from '@angular/core';
import type { Signal } from '@angular/core';
import type { MudMenuItem } from './mud-menu-item.component';

/** @description Menu semantics: `contextual` (ARIA menu of actions) or `selection` (ARIA listbox). */
export const MUD_MENU_TYPES = ['contextual', 'selection'] as const;
export type MudMenuType = (typeof MUD_MENU_TYPES)[number];

/** @description Leading element rendered before an item's label. */
export const MUD_MENU_ITEM_LEADINGS = ['none', 'icon', 'checkbox', 'radio'] as const;
export type MudMenuItemLeading = (typeof MUD_MENU_ITEM_LEADINGS)[number];

/** @description Horizontal panel placement relative to the trigger (Material semantics). */
export type MudMenuPositionX = 'before' | 'after';

/** @description Vertical panel placement relative to the trigger (Material semantics). */
export type MudMenuPositionY = 'above' | 'below';

/** @docs-private Trigger surface the panel drives; implemented by MudMenuTrigger. */
export interface MudMenuTriggerHandle {
  readonly isSubmenu: boolean;
  _childTrigger: MudMenuTriggerHandle | null;
  _hostItem: MudMenuItem | null;
  close(restoreFocus: boolean): void;
  closeAll(restoreFocus: boolean): void;
  _containsEvent(target: Node): boolean;
  _scheduleClose(): void;
  _hoverOpen(): void;
  _checkAim(): boolean;
  _pointerInPanel(): boolean;
}

/** @docs-private Panel surface items talk to; implemented by MudMenu (breaks the import cycle). */
export interface MudMenuPanel {
  readonly type: Signal<MudMenuType>;
  readonly value: Signal<string | undefined>;
  readonly _panelId: string;
  readonly _attachedTrigger: Signal<MudMenuTriggerHandle | null>;
  _register(item: MudMenuItem): void;
  _unregister(item: MudMenuItem): void;
  _activate(item: MudMenuItem): void;
  _itemEntered(item: MudMenuItem): void;
  _itemLeft(item: MudMenuItem): void;
}

/** @docs-private Provided by MudMenu on itself; items and item-hosted triggers inject it. */
export const MUD_MENU_PANEL = new InjectionToken<MudMenuPanel>('MUD_MENU_PANEL');
