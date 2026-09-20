import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudBreadcrumb } from './mud-breadcrumb.component';
import { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';

@Component({
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb [maxVisible]="4">
      <ol>
        @for (crumb of crumbs(); track crumb) {
          <li mudBreadcrumbItem><a [href]="'/' + crumb">{{ crumb }}</a></li>
        }
      </ol>
    </nav>
  `,
})
class Host {
  readonly crumbs = signal(['unu', 'doi', 'trei', 'patru', 'cinci', 'sase']);
}

describe('MudBreadcrumb on the server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  });

  it('serializes the collapsed trail, not the full one', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    const collapsed = nav.querySelectorAll('.mud-breadcrumb__item--collapsed');

    // The collapse is a pure signal, so it must already be decided in the
    // server HTML — otherwise the trail flashes at full length before hydration.
    expect(collapsed.length).toBe(3);
  });

  it('places the overflow trigger in the right DOM position on the server', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const list = fixture.nativeElement.querySelector('ol') as HTMLElement;

    // Inside the consumer's <ol>, which is where the first crumb's
    // ViewContainerRef anchors it — the back link is a sibling of the list, not
    // of the crumbs, so it cannot perturb this ordering on any platform.
    const children = [...list.children];

    expect(children[0].tagName.toLowerCase()).toBe('li');
    expect(children[1].tagName.toLowerCase()).toBe('mud-breadcrumb-overflow');
    expect(children[1].getAttribute('role')).toBe('listitem');
  });

  it('renders without touching the browser', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    expect(error).not.toHaveBeenCalled();

    error.mockRestore();
  });
});
