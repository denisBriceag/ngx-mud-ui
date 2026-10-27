import { Component } from '@angular/core';
import { renderOnServer } from '../../../../core/src/lib/specs/render-on-server.test-helper';
import { MudButton } from '../mud-button.directive';

@Component({ selector: 'mud-ssr-root', imports: [MudButton], template: `<button mudButton>Go</button>` })
class SsrButton {}

describe('button SSR', () => {
  it('emits the button stylesheet into the server HTML', async () => {
    const html = await renderOnServer(SsrButton);

    expect(html).toMatch(/<style[^>]*>[^<]*\.mud-btn/);
  });
});
