import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudTag } from 'ngx-mud-ui/tag';

// The icons are registered once in app.config.ts: provideMudIcons([checkmarkSmall, chevronRightSmall])
@Component({
  selector: 'app-tag-icons',
  imports: [MudTag, MudIconComponent],
  template: `
    <div class="row">
      <mud-tag color="success"
        ><mud-icon icon-start name="checkmark-small" [scale]="16" />Aprobat</mud-tag
      >
      <mud-tag color="brand"
        >Detalii<mud-icon icon-end name="chevron-right-small" [scale]="16"
      /></mud-tag>
    </div>
    <div class="row">
      <mud-tag size="small" color="success"
        ><mud-icon icon-start name="checkmark-small" [scale]="12" />Aprobat</mud-tag
      >
      <mud-tag size="small" color="danger" type="strong">Respins</mud-tag>
      <mud-tag size="small" color="success" disabled>Aprobat</mud-tag>
    </div>
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
  `,
})
export class TagIconsExample {}
