import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** @internal Button CSS; loaded once per app by MudButton / MudIconButton. */
@Component({
  selector: 'mud-button-styles',
  template: '',
  styleUrl: './mud-button.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _MudButtonStyles {}
