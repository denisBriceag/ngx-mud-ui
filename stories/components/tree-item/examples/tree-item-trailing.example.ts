import { Component } from '@angular/core';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudTag } from 'ngx-mud-ui/tag';
import { MudTreeItem } from 'ngx-mud-ui/tree-item';

@Component({
  selector: 'app-tree-item-trailing',
  imports: [MudTreeItem, MudBadge, MudTag],
  template: `
    <a mud-tree-item href="#requests">
      Requests
      <span secondaryLabel>12 new</span>
    </a>
    <a mud-tree-item href="#messages">
      Messages
      <mud-badge trailing [count]="3" variant="danger" size="xl" />
    </a>
    <a mud-tree-item href="#archive">
      Archive
      <mud-badge trailing [count]="128" variant="neutral" size="xl" />
    </a>
    <a mud-tree-item href="#signature">
      Electronic signature
      <mud-tag trailing color="brand" size="sm">New</mud-tag>
    </a>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      max-width: 320px;
    }
  `,
})
export class TreeItemTrailingExample {}
