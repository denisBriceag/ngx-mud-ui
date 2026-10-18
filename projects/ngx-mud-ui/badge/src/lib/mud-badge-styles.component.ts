import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** @internal Badge CSS; loaded by MudBadge and MudCornerBadge (nothing else injects it — project `<mud-badge>`, not a raw `.badge`). */
@Component({
  selector: 'mud-badge-styles',
  template: '',
  styleUrl: './mud-badge.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _MudBadgeStyles {}
