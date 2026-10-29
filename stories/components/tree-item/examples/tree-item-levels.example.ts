import { Component } from '@angular/core';
import { MudTreeItem } from 'ngx-mud-ui/tree-item';

@Component({
  selector: 'app-tree-item-levels',
  imports: [MudTreeItem],
  template: `
    <a mud-tree-item href="#services">Services</a>
    <a mud-tree-item href="#documents" [level]="2">Documents</a>
    <a mud-tree-item href="#passport" [level]="3" selected>Passport</a>
    <a mud-tree-item href="#id-card" [level]="3">ID card</a>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      max-width: 320px;
    }
  `,
})
export class TreeItemLevelsExample {}
