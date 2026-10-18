import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** @internal Sidebar CSS; loaded by every sidebar piece that can render alone. */
@Component({
  selector: 'mud-sidebar-styles',
  template: '',
  styleUrl: './mud-sidebar.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _MudSidebarStyles {}
