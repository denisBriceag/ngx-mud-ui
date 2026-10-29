import { Component } from '@angular/core';
import type { MudTagColor, MudTagType } from 'ngx-mud-ui/tag';
import { MudTag } from 'ngx-mud-ui/tag';

@Component({
  selector: 'app-tag-types',
  imports: [MudTag],
  template: `
    @for (type of types; track type) {
      <div class="row">
        <code>{{ type }}</code>
        @for (color of colors; track color) {
          @if (!(color === 'info' && type === 'outlined')) {
            <mud-tag [color]="color" [type]="type">{{ color }}</mud-tag>
          }
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    code {
      width: 72px;
    }
  `,
})
export class TagTypesExample {
  readonly types: MudTagType[] = ['subtle', 'strong', 'outlined'];
  readonly colors: MudTagColor[] = [
    'neutral',
    'muted',
    'brand',
    'info',
    'success',
    'accent',
    'danger',
  ];
}
