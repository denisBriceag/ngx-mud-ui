import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, computed, signal } from '@angular/core';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudFileItem } from 'ngx-mud-ui/file-input';
import {
  injectMudFormatLocale,
  injectMudLabels,
  MUD_LABELS_RO,
  MUD_LABELS_RU,
  provideMudFormatLocale,
  provideMudLabels,
} from 'ngx-mud-ui/i18n';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPagination } from 'ngx-mud-ui/pagination';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';
import { MudSelectInput } from 'ngx-mud-ui/select-input';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';

import { LabelReference } from './label-reference.component';

type Lang = 'en' | 'ro' | 'ru';

// Module-level so the demo's providers and its language switch read the one signal.
const LANG = signal<Lang>('en');

const LANGS: readonly { code: Lang; name: string; locale: string }[] = [
  { code: 'en', name: 'English', locale: 'en-US' },
  { code: 'ro', name: 'Română', locale: 'ro-MD' },
  { code: 'ru', name: 'Русский', locale: 'ru-RU' },
];

// The app's own texts: the library never translates what you put in, so the demo does it like an app would.
const APP_TEXT: Record<
  Lang,
  { received: string; district: string; locality: string; date: string; cities: readonly string[] }
> = {
  en: {
    received: 'Your application was received.',
    district: 'District',
    locality: 'Locality',
    date: 'Date',
    cities: ['Chișinău', 'Bălți', 'Cahul'],
  },
  ro: {
    received: 'Cererea dumneavoastră a fost primită.',
    district: 'Raion',
    locality: 'Localitate',
    date: 'Data',
    cities: ['Chișinău', 'Bălți', 'Cahul'],
  },
  ru: {
    received: 'Ваша заявка получена.',
    district: 'Район',
    locality: 'Населённый пункт',
    date: 'Дата',
    cities: ['Кишинёв', 'Бельцы', 'Кагул'],
  },
};

const FILENAME = 'application.pdf';

/** One signal drives the labels and the formatting locale of the whole demo subtree. */
@Component({
  selector: 'mud-localization-demo',
  imports: [
    MudBanner,
    MudDateInput,
    MudFileItem,
    MudLabel,
    MudPagination,
    MudSegment,
    MudSegmentedControl,
    MudSelectInput,
  ],
  providers: [
    provideMudLabels(
      computed(() => (LANG() === 'ro' ? MUD_LABELS_RO : LANG() === 'ru' ? MUD_LABELS_RU : {})),
    ),
    provideMudFormatLocale(computed(() => LANGS.find((entry) => entry.code === LANG())!.locale)),
  ],
  template: `
    <div class="bar">
      <mud-segmented-control
        aria-label="Language"
        [value]="lang()"
        (valueChange)="lang.set($event!)"
      >
        @for (entry of langs; track entry.code) {
          <button mud-segment [value]="entry.code">{{ entry.name }}</button>
        }
      </mud-segmented-control>
      <span class="bar__locale"
        >Format locale <code>{{ locale() }}</code></span
      >
    </div>

    <div class="layout">
      <div class="fields">
        <mud-banner closable variant="info">{{ text().received }}</mud-banner>

        <mud-select-input searchable [options]="options()">
          <mud-label>{{ text().district }}</mud-label>
        </mud-select-input>

        <!-- No options: opening it shows the library's empty-list text. -->
        <mud-select-input [options]="[]">
          <mud-label>{{ text().locality }}</mud-label>
        </mud-select-input>

        <mud-date-input value="2026-03-15" clearable>
          <mud-label>{{ text().date }}</mud-label>
        </mud-date-input>

        <mud-file-item [filename]="filename" [size]="1572864" />

        <mud-pagination [length]="200" [pageIndex]="4" />
      </div>

      <aside class="heard" aria-label="What screen readers hear">
        <h4 class="heard__title">What screen readers hear</h4>
        <p class="heard__hint">Library texts that never appear on screen, live from the labels.</p>
        <dl>
          @for (item of heard(); track item.where) {
            <div class="heard__item">
              <dt>{{ item.where }}</dt>
              <dd>“{{ item.text }}”</dd>
            </div>
          }
        </dl>
      </aside>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 24px;
      font-family: var(--mud-font-family-base);
      color: var(--mud-color-text-base-default);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 24px;
      margin-bottom: 24px;
    }
    .bar__locale {
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
    .bar__locale code {
      margin-left: 4px;
      padding: 2px 8px;
      border-radius: var(--mud-border-radius-16);
      background: var(--mud-color-background-base-tertiary);
      color: var(--mud-color-text-base-default);
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(220px, 300px);
      gap: 32px;
      align-items: start;
    }
    .fields {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .heard {
      position: sticky;
      top: 16px;
      padding: 20px;
      border-radius: var(--mud-border-radius-12);
      background: var(--mud-color-background-base-secondary);
    }
    .heard__title {
      margin: 0 0 4px;
      font-size: 16px;
    }
    .heard__hint {
      margin: 0 0 16px;
      font-size: 13px;
      color: var(--mud-color-text-base-secondary);
    }
    dl {
      margin: 0;
    }
    .heard__item {
      padding: 10px 0;
      border-top: 1px solid var(--mud-color-border-base-subtle);
    }
    dt {
      font-size: 12px;
      color: var(--mud-color-text-base-secondary);
    }
    dd {
      margin: 2px 0 0;
      font-weight: var(--mud-font-weight-semibold);
      color: var(--mud-color-text-brand-default);
    }
    @media (max-width: 720px) {
      :host {
        padding: 16px 0;
      }
      .layout {
        grid-template-columns: minmax(0, 1fr);
      }
      .heard {
        position: static;
      }
    }
  `,
})
class LocalizationDemo {
  private readonly _labels = injectMudLabels();

  readonly lang = LANG;
  readonly langs = LANGS;
  readonly filename = FILENAME;
  readonly locale = injectMudFormatLocale();
  readonly text = computed(() => APP_TEXT[LANG()]);
  readonly options = computed<MudSelectOption<string>[]>(() =>
    ['ch', 'bl', 'cl'].map((value, i) => ({ value, label: this.text().cities[i] })),
  );

  readonly heard = computed(() => {
    const l = this._labels();

    return [
      { where: 'Banner close button', text: l.banner.close },
      { where: 'File remove button', text: l.fileItem.remove(FILENAME) },
      { where: 'Current page', text: l.pagination.pageAria(5, 20) },
      { where: 'Next page button', text: l.pagination.nextAria(6) },
      { where: 'Date field clear button', text: l.datePicker.clear },
    ];
  });
}

const meta: Meta = {
  title: 'Foundations/Localization',
  decorators: [moduleMetadata({ imports: [LocalizationDemo, LabelReference] })],
};

export default meta;

/** Switch the language: labels, announcements, month names and numbers follow. */
export const LanguageSwitcher: StoryObj = {
  name: 'Language switcher',
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `providers: [
  provideMudLabels(computed(() => (lang() === 'ro' ? MUD_LABELS_RO : lang() === 'ru' ? MUD_LABELS_RU : {}))),
  provideMudFormatLocale(computed(() => LOCALES[lang()])),
]`,
        language: 'ts',
      },
    },
  },
  render: () => ({ template: `<mud-localization-demo />` }),
};

/** Every built-in text, generated from the English, Romanian and Russian packs. */
export const Reference: StoryObj = {
  name: 'Label reference',
  parameters: {
    controls: { disable: true },
    docs: { canvas: { sourceState: 'none' } },
  },
  render: () => ({ template: `<mud-label-reference />` }),
};
