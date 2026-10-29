import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';

@Component({
  selector: 'app-menu-nested',
  imports: [MudButton, MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button type="button" mudButton="outlined" [mudMenuTriggerFor]="root">Options</button>

    <mud-menu #root aria-label="Options">
      <mud-menu-item [mudMenuTriggerFor]="share">Share</mud-menu-item>
      <mud-menu-item value="rename">Rename</mud-menu-item>
      <mud-menu-item [mudMenuTriggerFor]="exportAs">Export</mud-menu-item>
    </mud-menu>

    <mud-menu #share aria-label="Share">
      <mud-menu-item value="email">Email</mud-menu-item>
      <mud-menu-item value="link">Copy link</mud-menu-item>
    </mud-menu>

    <mud-menu #exportAs aria-label="Export">
      <mud-menu-item value="pdf">PDF</mud-menu-item>
      <mud-menu-item [mudMenuTriggerFor]="excel">Excel</mud-menu-item>
    </mud-menu>

    <mud-menu #excel aria-label="Excel">
      <mud-menu-item value="xlsx">Workbook (.xlsx)</mud-menu-item>
      <mud-menu-item value="xls">Excel 97–2003 (.xls)</mud-menu-item>
    </mud-menu>
  `,
})
export class MenuNestedExample {}
