import type { TemplateRef } from '@angular/core';
import { Component, inject, signal, viewChild } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudToastDismissReason } from 'ngx-mud-ui/toast';
import { MudToast } from 'ngx-mud-ui/toast';

@Component({
  selector: 'app-toast-actions',
  imports: [MudButton],
  template: `
    <button type="button" mudButton="outlined" color="destructive" (click)="remove()">
      Delete document
    </button>
    <p>Documents: {{ count() }} · last toast closed by: {{ reason() ?? '—' }}</p>

    <!-- Receives the MudToastRef as its implicit context. -->
    <ng-template #undoActions let-ref>
      <button
        type="button"
        mudButton
        color="neutral"
        size="small"
        (click)="undo(); ref.dismiss('action')"
      >
        Anulează
      </button>
    </ng-template>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class ToastActionsExample {
  private readonly _toast = inject(MudToast);
  private readonly _undoActions = viewChild.required<TemplateRef<unknown>>('undoActions');

  readonly count = signal(5);
  readonly reason = signal<MudToastDismissReason | null>(null);

  remove(): void {
    this.count.update((count) => count - 1);

    const ref = this._toast.open({
      // Long enough to read and act on.
      duration: 8000,
      data: { message: 'Documentul a fost șters.', actions: this._undoActions() },
    });

    ref.dismissed.subscribe((reason) => this.reason.set(reason));
  }

  undo(): void {
    this.count.update((count) => count + 1);
  }
}
