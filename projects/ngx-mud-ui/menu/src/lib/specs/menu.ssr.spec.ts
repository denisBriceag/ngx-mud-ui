import { Component } from '@angular/core';
import { MudMenu } from '../mud-menu.component';
import { MudMenuItem } from '../mud-menu-item.component';
import { MudMenuTrigger } from '../mud-menu-trigger.directive';
import { renderOnServer } from '../../../../core/src/lib/specs/render-on-server.test-helper';

@Component({
  selector: 'mud-ssr-root',
  imports: [MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button class="root-trigger" [mudMenuTriggerFor]="share">Share</button>
    <mud-menu open aria-label="Options">
      <mud-menu-item class="share-item" [mudMenuTriggerFor]="share">Share</mud-menu-item>
      <mud-menu-item value="rename">Rename</mud-menu-item>
    </mud-menu>
    <mud-menu #share aria-label="Share">
      <mud-menu-item value="email">Email</mud-menu-item>
    </mud-menu>
  `,
})
class NestedPage {}

describe('Nested menu on the server (SSR)', () => {
  it('renders submenu triggers collapsed, with no submenu panel or overlay', async () => {
    const html = await renderOnServer(NestedPage);

    expect(html).toContain('ng-server-context=');
    expect(html).toMatch(/<mud-menu-item[^>]*class="[^"]*share-item[^"]*"[^>]*aria-expanded="false"/);
    expect(html).toContain('menu__chevron');
    expect(html).toContain('Rename');
    expect(html).not.toContain('Email'); // submenu content lives in an unattached template
    expect(html).not.toContain('cdk-overlay-container');
  });
});
