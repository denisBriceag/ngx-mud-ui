import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** @internal Link CSS; loaded once per app by MudLink. */
@Component({
  selector: 'mud-link-styles',
  template: '',
  styleUrl: './mud-link.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _MudLinkStyles {}
