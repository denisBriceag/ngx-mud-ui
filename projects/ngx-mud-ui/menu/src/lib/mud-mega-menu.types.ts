import { InjectionToken } from '@angular/core';

/** @docs-private Trigger surface the panel drives; implemented by MudMegaMenuTrigger. */
export interface MudMegaMenuTriggerHandle {
  readonly _hostElement: HTMLElement;
  close(restoreFocus: boolean): void;
}

/** @docs-private Panel surface links talk to; implemented by MudMegaMenu (breaks the import cycle). */
export interface MudMegaMenuPanel {
  _linkActivated(): void;
}

/** @docs-private Provided by MudMegaMenu on itself; links inject it through projection. */
export const MUD_MEGA_MENU = new InjectionToken<MudMegaMenuPanel>('MUD_MEGA_MENU');
