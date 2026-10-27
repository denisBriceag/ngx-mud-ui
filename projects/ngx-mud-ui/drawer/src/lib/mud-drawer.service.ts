import type { TemplateRef } from '@angular/core';
import { Injectable, Injector, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import type { DialogRef } from '@angular/cdk/dialog';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import type { GlobalPositionStrategy } from '@angular/cdk/overlay';
import type { ComponentType } from '@angular/cdk/portal';
import { MudDrawerRef } from './mud-drawer-ref';
import { MudDrawerContainer } from './mud-drawer-container.component';
import type { MudDrawerConfig, MudDrawerPosition } from './mud-drawer-config';

/**
 * ```ts
 * private readonly drawer = inject(MudDrawer);
 * const ref = this.drawer.open(FiltersComponent, { position: 'left' });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MudDrawer {
  private readonly _cdkDialog = inject(Dialog);
  private readonly _injector = inject(Injector);

  /** @description Opens a component or template in a drawer pinned to one viewport edge. */
  open<R = unknown, D = unknown>(
    componentOrTemplate: ComponentType<unknown> | TemplateRef<unknown>,
    config: MudDrawerConfig<D> = {},
  ): MudDrawerRef<R> {
    const position = config.position ?? 'right';
    const isSide = position === 'left' || position === 'right';
    // CDK calls `providers` synchronously, so the component and caller share this ref.
    let mudRef!: MudDrawerRef<R>;

    this._cdkDialog.open<R, D>(componentOrTemplate, {
      container: MudDrawerContainer,
      data: config.data,
      ariaLabel: config.ariaLabel ?? null,
      autoFocus: config.autoFocus ?? 'first-tabbable',
      restoreFocus: config.restoreFocus ?? true,
      positionStrategy: pinToEdge(createGlobalPositionStrategy(this._injector), position),
      width: isSide ? config.width?.trim() || '382px' : '100%',
      height: isSide ? '100%' : config.height?.trim() || undefined,
      maxWidth: '100%',
      maxHeight: '100%',
      minWidth: undefined,
      minHeight: undefined,
      hasBackdrop: true,
      panelClass: [
        'mud-drawer-panel',
        `mud-drawer-panel--${position}`,
        ...(Array.isArray(config.panelClass) ? config.panelClass : config.panelClass ? [config.panelClass] : []),
      ],
      backdropClass: 'mud-drawer-backdrop',
      disableClose: true,
      providers: (dialogRef: DialogRef<R>) => {
        mudRef = new MudDrawerRef<R>(dialogRef);

        if (config.closeOnBackdrop ?? true) {
          dialogRef.backdropClick.subscribe(() => mudRef.close(undefined, 'backdrop'));
        }

        if (config.closeOnEscape ?? true) {
          dialogRef.keydownEvents.subscribe((event) => {
            if (event.key === 'Escape' && !hasModifierKey(event) && !event.defaultPrevented) {
              event.preventDefault();
              mudRef.close(undefined, 'escape');
            }
          });
        }

        return [{ provide: MudDrawerRef, useValue: mudRef }];
      },
      ...({ position } as object),
    });

    return mudRef;
  }
}

function pinToEdge(strategy: GlobalPositionStrategy, position: MudDrawerPosition): GlobalPositionStrategy {
  switch (position) {
    case 'left':
      return strategy.left('0').top('0');
    case 'right':
      return strategy.right('0').top('0');
    case 'top':
      return strategy.top('0').left('0');
    case 'bottom':
      return strategy.bottom('0').left('0');
  }
}
