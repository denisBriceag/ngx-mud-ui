import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** @internal Listbox panel CSS (.menu-panel) shared by select-input and phone-input. */
@Component({
  selector: 'mud-menu-panel-styles',
  template: '',
  styleUrl: './mud-menu-panel.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _MudMenuPanelStyles {}
