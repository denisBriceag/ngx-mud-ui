import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** @internal Menu panel CSS (.menu); loaded by MudMenu and the breadcrumb overflow (shared, so neither entry depends on the other). */
@Component({
  selector: 'mud-menu-styles',
  template: '',
  styleUrl: './mud-menu.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _MudMenuStyles {}
