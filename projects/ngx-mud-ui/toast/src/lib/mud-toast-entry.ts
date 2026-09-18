import type { ComponentType } from '@angular/cdk/portal';
import type { Injector, WritableSignal } from '@angular/core';
import type { MudToastData, ResolvedToastConfig } from './mud-toast-config';
import type { MudToastRef } from './mud-toast-ref';

/** One live toast, shared by the service, its stack and its item component. */
export interface MudToastEntry {
  readonly id: number;
  readonly config: ResolvedToastConfig;
  readonly ref: MudToastRef<unknown>;
  /** Content for the built-in surface; undefined when opened from a component. */
  readonly data?: MudToastData;
  /** Set when opened via openFromComponent. */
  readonly componentType?: ComponentType<unknown>;
  /** Injector carrying MUD_TOAST_DATA and MudToastRef for componentType. */
  readonly componentInjector?: Injector;
  /** Invoked once componentType has rendered; the service uses it to publish ref.instance. */
  readonly onComponentRendered?: (instance: unknown) => void;
  /** True once the exit animation has begun; the item stays mounted until it ends. */
  readonly leaving: WritableSignal<boolean>;
  /** Element focused when the toast was opened; focus returns here if needed. */
  readonly opener?: HTMLElement | null;
}

let _nextId = 0;

/** @description Monotonic id used as the @for track key. */
export function nextToastId(): number {
  return ++_nextId;
}
