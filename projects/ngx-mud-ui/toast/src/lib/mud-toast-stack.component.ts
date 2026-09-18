import { ChangeDetectionStrategy, Component, computed, input, viewChildren } from '@angular/core';
import type { MudToastVerticalPosition } from './mud-toast-config';
import type { MudToastEntry } from './mud-toast-entry';
import { MudToastItem } from './mud-toast-item.component';

type ToastStackGap = 'none' | 'same' | 'mixed';

interface PositionedEntry {
  readonly entry: MudToastEntry;
  readonly gap: ToastStackGap;
}

/** The overlay-hosted column for one screen position. */
@Component({
  selector: 'mud-toast-stack',
  imports: [MudToastItem],
  template: `
    @for (item of positioned(); track item.entry.id) {
      <mud-toast-item
        [entry]="item.entry"
        [class.mud-toast-stack__item--gap-same]="item.gap === 'same'"
        [class.mud-toast-stack__item--gap-mixed]="item.gap === 'mixed'"
      />
    }
  `,
  host: {
    class: 'mud-toast-stack',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudToastStack {
  /** Insertion order, oldest first. */
  readonly entries = input<readonly MudToastEntry[]>([]);
  readonly verticalPosition = input<MudToastVerticalPosition>('top');

  private readonly _items = viewChildren(MudToastItem);

  readonly positioned = computed<readonly PositionedEntry[]>(() => {
    const entries = this.entries();
    const visual = this.verticalPosition() === 'top' ? [...entries].reverse() : [...entries];

    return visual.map((entry, index) => ({
      entry,
      gap:
        index === 0
          ? ('none' as const)
          : visual[index - 1].config.variant === entry.config.variant
            ? ('same' as const)
            : ('mixed' as const),
    }));
  });

  /** @description Looks up a rendered item so the service can play its exit animation. */
  itemFor(id: number): MudToastItem | undefined {
    return this._items().find((item) => item.entry().id === id);
  }
}
