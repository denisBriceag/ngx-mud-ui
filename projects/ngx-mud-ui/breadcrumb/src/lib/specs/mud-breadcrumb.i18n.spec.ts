import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudBreadcrumb } from '../mud-breadcrumb.component';
import { MudBreadcrumbItem } from '../mud-breadcrumb-item.directive';
import { MudBreadcrumbOverflow } from '../mud-breadcrumb-overflow.component';

@Component({
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb [maxVisible]="2" [label]="label()" [overflowLabel]="overflow()">
      <ol>
        @for (n of [1, 2, 3, 4, 5]; track n) {
          <li mudBreadcrumbItem><a [href]="'/n' + n">Nivel {{ n }}</a></li>
        }
      </ol>
    </nav>
  `,
})
class Host {
  readonly label = signal<string | undefined>(undefined);
  readonly overflow = signal<string | undefined>(undefined);
}

@Component({
  imports: [MudBreadcrumbOverflow],
  template: `<mud-breadcrumb-overflow />`,
})
class OverflowHost {}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    nav: () => el.querySelector('nav')!.getAttribute('aria-label'),
    trigger: () => el.querySelector('mud-breadcrumb-overflow button')?.getAttribute('aria-label'),
  };
}

describe('MudBreadcrumb i18n', () => {
  it('uses the English defaults with no provider', async () => {
    const h = await render();

    expect(h.nav()).toBe('Breadcrumb');
    expect(h.trigger()).toBe('Show collapsed pages');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    expect(h.nav()).toBe(MUD_LABELS_RO.breadcrumb!.navigation);
    expect(h.trigger()).toBe(MUD_LABELS_RO.breadcrumb!.overflow);
  });

  it('instance inputs win over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    h.host.label.set('Mine');
    h.host.overflow.set('More');
    await h.fixture.whenStable();
    expect(h.nav()).toBe('Mine');
    expect(h.trigger()).toBe('More');
  });

  it('blank inputs fall back', async () => {
    const h = await render();

    h.host.label.set(' ');
    h.host.overflow.set('');
    await h.fixture.whenStable();
    expect(h.nav()).toBe('Breadcrumb');
    expect(h.trigger()).toBe('Show collapsed pages');
  });

  it('the overflow component alone reads the breadcrumb.overflow label', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels({ breadcrumb: { overflow: 'Mai multe' } })] });
    const fixture = TestBed.createComponent(OverflowHost);

    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('button')!.getAttribute('aria-label')).toBe('Mai multe');
  });
});
