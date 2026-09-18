import { InjectionToken } from '@angular/core';
import type { TemplateRef } from '@angular/core';

export type MudToastVariant = 'info' | 'warning' | 'success' | 'error';
export type MudToastHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
export type MudToastVerticalPosition = 'top' | 'bottom';
export type MudToastDismissReason = 'timeout' | 'close-button' | 'action' | 'dismiss-all';

/**
 * ```ts
 * toast.open({ variant: 'success', data: { title: 'Salvat', message: 'Cererea a fost trimisă.' } });
 * ```
 */
export interface MudToastData {
  /** @description Optional bold heading. A TemplateRef receives the MudToastRef as $implicit. */
  title?: string | TemplateRef<unknown>;
  /** @description Message body. A TemplateRef receives the MudToastRef as $implicit. */
  message: string | TemplateRef<unknown>;
  /** @description Optional action row below the body. Receives the MudToastRef as $implicit. */
  actions?: TemplateRef<unknown>;
  /** @description Replaces the per-variant leading glyph. Render a 24x24 icon; receives the MudToastRef as $implicit. */
  icon?: TemplateRef<unknown>;
}

export interface MudToastBaseConfig {
  /** @description Semantic colour family. */
  variant?: MudToastVariant;
  /** @description Auto-dismiss delay in ms. 0 never auto-dismisses. */
  duration?: number;
  /** @description Pauses the dismiss timer while the pointer is over the toast. */
  pauseOnHover?: boolean;
  /** @description Announced via LiveAnnouncer instead of the toast's own live region. */
  announcementMessage?: string;
  /** @description Inline anchor. start/end are direction-aware; left/right are not. */
  horizontalPosition?: MudToastHorizontalPosition;
  /** @description Block anchor. The newest toast always sits nearest this edge. */
  verticalPosition?: MudToastVerticalPosition;
  /** @description Renders the trailing close button. */
  showCloseButton?: boolean;
  /** @description Accessible name of the close button. Localize per app. */
  closeLabel?: string;
}

export interface MudToastConfig extends MudToastBaseConfig {
  /** @description Content payload for the built-in surface. */
  data: MudToastData;
}

export interface MudToastComponentConfig<D = unknown> extends MudToastBaseConfig {
  /** @description Payload injected into the opened component via MUD_TOAST_DATA. */
  data?: D;
}

export interface MudToastDefaultOptions extends MudToastBaseConfig {
  /** @description Toasts visible at once across all positions before queueing. */
  maxVisible?: number;
}

/** Fully-resolved config the stack and item components consume. */
export interface ResolvedToastConfig extends Required<Omit<MudToastBaseConfig, 'announcementMessage'>> {
  announcementMessage?: string;
}

/** Injection token delivering config.data to a component opened via openFromComponent. */
export const MUD_TOAST_DATA = new InjectionToken<unknown>('MUD_TOAST_DATA');

/** App-wide toast defaults. */
export const MUD_TOAST_DEFAULT_OPTIONS = new InjectionToken<MudToastDefaultOptions>('MUD_TOAST_DEFAULT_OPTIONS');

/** Library defaults, used for any field the app does not override. */
export const MUD_TOAST_FALLBACK_OPTIONS: Required<ResolvedToastConfig> & { maxVisible: number } = {
  variant: 'info',
  duration: 4000,
  pauseOnHover: true,
  announcementMessage: '',
  horizontalPosition: 'end',
  verticalPosition: 'top',
  showCloseButton: true,
  closeLabel: 'Close',
  maxVisible: 3,
};

/** @description Merges an open() config over app defaults over library fallbacks. */
export function resolveToastConfig(
  config: MudToastConfig | MudToastComponentConfig,
  defaults?: MudToastDefaultOptions | null,
): ResolvedToastConfig {
  const pick = <K extends keyof MudToastBaseConfig>(key: K): NonNullable<MudToastBaseConfig[K]> =>
    (config[key] ?? defaults?.[key] ?? MUD_TOAST_FALLBACK_OPTIONS[key]) as NonNullable<MudToastBaseConfig[K]>;

  const closeLabel = (config.closeLabel ?? defaults?.closeLabel)?.trim();
  const announcementMessage = (config.announcementMessage ?? defaults?.announcementMessage)?.trim();

  return {
    variant: pick('variant'),
    duration: pick('duration'),
    pauseOnHover: pick('pauseOnHover'),
    horizontalPosition: pick('horizontalPosition'),
    verticalPosition: pick('verticalPosition'),
    showCloseButton: pick('showCloseButton'),
    closeLabel: closeLabel || MUD_TOAST_FALLBACK_OPTIONS.closeLabel,
    announcementMessage: announcementMessage || undefined,
  };
}
