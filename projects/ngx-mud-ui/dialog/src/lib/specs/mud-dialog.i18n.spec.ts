import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudDialog } from '../mud-dialog.service';

@Component({ template: `<p>Body</p>` })
class Body {}

async function closeLabel(closeLabelConfig?: string): Promise<string | null> {
  TestBed.inject(MudDialog).open(Body, { closeLabel: closeLabelConfig });
  await TestBed.inject(ApplicationRef).whenStable();

  return document.querySelector('.dialog__close')!.getAttribute('aria-label');
}

@Component({ providers: [provideMudLabels({ dialog: { close: 'Sub' } })], template: '' })
class SubtreeHost {
  readonly dialog = inject(MudDialog);
}

describe('MudDialog i18n', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('uses the English default with no provider', async () => {
    expect(await closeLabel()).toBe('Close');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    expect(await closeLabel()).toBe(MUD_LABELS_RO.dialog!.close);
  });

  it('a config closeLabel wins', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    expect(await closeLabel('Mine')).toBe('Mine');
  });

  it('a subtree provideMudLabels does NOT reach dialogs', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const fixture = TestBed.createComponent(SubtreeHost);

    fixture.componentInstance.dialog.open(Body);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.querySelector('.dialog__close')!.getAttribute('aria-label')).toBe(MUD_LABELS_RO.dialog!.close);
  });

  it('blank closeLabel falls back', async () => {
    expect(await closeLabel('  ')).toBe('Close');
  });
});
