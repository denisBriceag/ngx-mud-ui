import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/** @internal Text-field CSS (.input-field) shared by every field component. */
@Component({
  selector: 'mud-input-field-styles',
  template: '',
  styleUrl: './mud-input-field.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class _MudInputFieldStyles {}
