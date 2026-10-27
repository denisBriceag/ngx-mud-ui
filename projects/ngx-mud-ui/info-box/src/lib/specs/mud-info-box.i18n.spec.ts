import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudInfoBox } from '../mud-info-box.component';

@Component({
  imports: [MudInfoBox],
  template: `<mud-info-box closable [closeLabel]="label()">Body</mud-info-box>`,
})
class Host {
  readonly label = signal<string | undefined>(undefined);
}

async function closeButton() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  return { fixture, button: () => (fixture.nativeElement as HTMLElement).querySelector('.info-box__close')! };
}

describe('MudInfoBox i18n', () => {
  it('uses the English default with no provider', async () => {
    const { button } = await closeButton();

    expect(button().getAttribute('aria-label')).toBe('Close');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { button } = await closeButton();

    expect(button().getAttribute('aria-label')).toBe(MUD_LABELS_RO.infoBox!.close);
  });

  it('an instance input wins over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, button } = await closeButton();

    fixture.componentInstance.label.set('Mine');
    await fixture.whenStable();
    expect(button().getAttribute('aria-label')).toBe('Mine');
  });

  it('blank closeLabel falls back', async () => {
    const { fixture, button } = await closeButton();

    fixture.componentInstance.label.set('   ');
    await fixture.whenStable();
    expect(button().getAttribute('aria-label')).toBe('Close');
  });
});
