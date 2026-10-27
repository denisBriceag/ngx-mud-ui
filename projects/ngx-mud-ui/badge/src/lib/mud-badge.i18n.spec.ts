import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudBadge } from './mud-badge.component';

@Component({
  imports: [MudBadge],
  template: `<mud-badge type="dot" [notificationLabel]="label()" /><mud-badge [count]="count()" [max]="max()" />`,
})
class Host {
  readonly label = signal<string | undefined>(undefined);
  readonly count = signal(120);
  readonly max = signal(99);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const badges = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll('mud-badge')];

  return { fixture, badges };
}

describe('MudBadge i18n', () => {
  it('uses the English default with no provider', async () => {
    const { badges } = await render();

    expect(badges()[0].getAttribute('aria-label')).toBe('Notification');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { badges } = await render();

    expect(badges()[0].getAttribute('aria-label')).toBe(MUD_LABELS_RO.badge!.notification);
  });

  it('an instance input wins', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, badges } = await render();

    fixture.componentInstance.label.set('Mine');
    await fixture.whenStable();
    expect(badges()[0].getAttribute('aria-label')).toBe('Mine');
  });

  it('does not group thousands in count or max', async () => {
    const { fixture, badges } = await render();

    fixture.componentInstance.max.set(1000);
    fixture.componentInstance.count.set(1500);
    await fixture.whenStable();
    expect(badges()[1].textContent!.trim()).toBe('1000+');
    fixture.componentInstance.count.set(1000);
    await fixture.whenStable();
    expect(badges()[1].textContent!.trim()).toBe('1000');
  });

  it('overflow formats in the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });
    const { badges } = await render();

    expect(badges()[1].textContent!.trim()).toBe('٩٩+');
  });
});
