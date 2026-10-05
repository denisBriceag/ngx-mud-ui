import { InjectionToken, type Signal } from '@angular/core';

/** What a sidebar's children need; a token keeps group/toggle/layout free of a MudSidebar import cycle. */
export interface MudSidebarContext {
  readonly id: Signal<string>;
  readonly collapsed: Signal<boolean>;
  readonly compact: Signal<boolean>;
  readonly narrow: Signal<boolean>;
  toggle(): void;
}

export const MUD_SIDEBAR = new InjectionToken<MudSidebarContext>('MudSidebar');

/** @internal Not in public-api: what MudSidebarGroup needs on top of the public context. */
export interface MudSidebarGroupHost extends MudSidebarContext {
  isFirstGroup(group: object): boolean;
}

/** @internal Not in public-api; MudSidebar provides it alongside MUD_SIDEBAR. */
export const MUD_SIDEBAR_GROUP_HOST = new InjectionToken<MudSidebarGroupHost>('MudSidebarGroupHost');
