import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, computed, signal } from '@angular/core';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudFileItem } from 'ngx-mud-ui/file-input';
import { MUD_LABELS_RO, MUD_LABELS_RU, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPagination } from 'ngx-mud-ui/pagination';
import { MudSelectInput } from 'ngx-mud-ui/select-input';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';

type Lang = 'en' | 'ro' | 'ru';

// Module-level so the demo's providers and its buttons read the one signal.
const LANG = signal<Lang>('en');

const LANGS: readonly { code: Lang; name: string; locale: string }[] = [
  { code: 'en', name: 'English', locale: 'en-US' },
  { code: 'ro', name: 'Română', locale: 'ro-MD' },
  { code: 'ru', name: 'Русский', locale: 'ru-RU' },
];

// The app's own texts: the library never translates what you put in, so the demo does it like an app would.
const APP_TEXT: Record<Lang, { received: string; district: string; locality: string; date: string; cities: readonly string[] }> = {
  en: { received: 'Your application was received.', district: 'District', locality: 'Locality', date: 'Date', cities: ['Chișinău', 'Bălți', 'Cahul'] },
  ro: { received: 'Cererea dumneavoastră a fost primită.', district: 'Raion', locality: 'Localitate', date: 'Data', cities: ['Chișinău', 'Bălți', 'Cahul'] },
  ru: { received: 'Ваша заявка получена.', district: 'Район', locality: 'Населённый пункт', date: 'Дата', cities: ['Кишинёв', 'Бельцы', 'Кагул'] },
};

/** One signal drives the labels and the formatting locale of the whole demo subtree. */
@Component({
  selector: 'mud-localization-demo',
  imports: [MudBanner, MudDateInput, MudFileItem, MudLabel, MudPagination, MudSelectInput],
  providers: [
    provideMudLabels(computed(() => (LANG() === 'ro' ? MUD_LABELS_RO : LANG() === 'ru' ? MUD_LABELS_RU : {}))),
    provideMudFormatLocale(computed(() => LANGS.find((entry) => entry.code === LANG())!.locale)),
  ],
  template: `
    <div style="display:flex;flex-direction:column;gap:24px;max-width:560px;padding:24px">
      <div role="group" aria-label="Language" style="display:flex;gap:8px">
        @for (entry of langs; track entry.code) {
          <button
            type="button"
            [attr.data-lang]="entry.code"
            [attr.aria-pressed]="lang() === entry.code"
            [style.font-weight]="lang() === entry.code ? '700' : '400'"
            (click)="lang.set(entry.code)"
          >
            {{ entry.name }}
          </button>
        }
      </div>

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

      <mud-file-item filename="application.pdf" [size]="1572864" />

      <mud-pagination [length]="200" [pageIndex]="4" />
    </div>
  `,
})
class LocalizationDemo {
  readonly lang = LANG;
  readonly langs = LANGS;
  readonly text = computed(() => APP_TEXT[LANG()]);
  readonly options = computed<MudSelectOption<string>[]>(() =>
    ['ch', 'bl', 'cl'].map((value, i) => ({ value, label: this.text().cities[i] })),
  );
}

const meta: Meta = {
  title: 'Foundations/Localization',
  decorators: [moduleMetadata({ imports: [LocalizationDemo] })],
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
