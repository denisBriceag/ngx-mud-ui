import { ChangeDetectionStrategy, Component, computed, ViewChild, ViewEncapsulation } from '@angular/core';
import { CdkDialogContainer } from '@angular/cdk/dialog';
import type { DialogConfig } from '@angular/cdk/dialog';
import { CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';
import type { MudDialogRef } from './mud-dialog-ref';

/** @docs-private CDK config carrying our extra fields (attached by MudDialog.open). */
export type MudResolvedDialogConfig = DialogConfig & {
  size: 'sm' | 'md' | 'lg';
  showCloseButton: boolean;
  closeLabel?: string;
  mudRefFactory: () => MudDialogRef;
};

/** @docs-private The card: chrome owner; consumers never use it directly. */
@Component({
  selector: 'mud-dialog-container',
  styleUrl: './mud-dialog-container.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [PortalModule],
  template: `
    @if (_mudConfig.showCloseButton) {
      <button
        type="button"
        class="dialog__close"
        [attr.aria-label]="_closeLabel()"
        (click)="_closeFromButton()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" focusable="false" aria-hidden="true">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.41 4.41a.833.833 0 0 1 1.18 0L10 8.821l4.41-4.41a.833.833 0 1 1 1.18 1.178L11.178 10l4.41 4.41a.833.833 0 0 1-1.178 1.18L10 11.178l-4.41 4.41a.833.833 0 0 1-1.18-1.178L8.821 10l-4.41-4.41a.833.833 0 0 1 0-1.18"
          />
        </svg>
      </button>
    }
    <ng-template cdkPortalOutlet />
  `,
  // Host metadata is NOT inherited from CdkDialogContainer; re-declared verbatim.
  host: {
    tabindex: '-1',
    '[attr.id]': '_config.id || null',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledByQueue[0]',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
    '[class]': '"dialog dialog--" + _mudConfig.size',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudDialogContainer extends CdkDialogContainer {
  @ViewChild(CdkPortalOutlet, { static: true }) declare _portalOutlet: CdkPortalOutlet;

  private readonly _labels = injectMudLabels();

  protected readonly _closeLabel = computed(() => _mudText(this._mudConfig.closeLabel, this._labels().dialog.close));

  /** @docs-private Resolved config incl. our fields (defaults applied by the service). */
  protected get _mudConfig(): MudResolvedDialogConfig {
    return this._config as MudResolvedDialogConfig;
  }

  /** @docs-private The × button routes through the mud ref so `closed` carries the reason. */
  protected _closeFromButton(): void {
    this._mudConfig.mudRefFactory().close(undefined, 'close-button');
  }
}
