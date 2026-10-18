import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { CdkDialogContainer } from '@angular/cdk/dialog';
import type { DialogConfig } from '@angular/cdk/dialog';
import { CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import type { MudDrawerPosition } from './mud-drawer-config';

export type MudResolvedDrawerConfig = DialogConfig & { position: MudDrawerPosition };

@Component({
  selector: 'mud-drawer-container',
  styleUrl: './mud-drawer-container.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [PortalModule],
  template: `<ng-template cdkPortalOutlet />`,
  host: {
    tabindex: '-1',
    '[attr.id]': '_config.id || null',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledByQueue[0]',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
    '[class]': '"drawer drawer--" + _mudConfig.position',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudDrawerContainer extends CdkDialogContainer {
  @ViewChild(CdkPortalOutlet, { static: true }) declare _portalOutlet: CdkPortalOutlet;

  protected get _mudConfig(): MudResolvedDrawerConfig {
    return this._config as MudResolvedDrawerConfig;
  }
}
