import type { MudLabels } from './mud-labels';

// Not in upstream — needs native-speaker review: datePicker.calendar, datePicker.previousMonth, datePicker.nextMonth,
// datePicker.previousYear, datePicker.nextYear, datePicker.chooseMonth, datePicker.chooseYear, datePicker.rangeStart,
// datePicker.rangeEnd, datePicker.formatHint, datePicker.rangeStartSelected, datePicker.rangeSelected,
// fileInput.fileList, fileInput.required, fileInput.rejected, fileItem.cancel, inputChip.rejectedMax,
// pagination.previousAria, pagination.nextAria (reworded for label-in-name), phoneInput.country, selectInput.noResults,
// stepper.blocked, table.sort, timePicker.picker, timePicker.formatHint
// timePicker.picker: upstream has 'Selectează ora' as an alternative to the current 'Oră'.

// Pure annotation: a dropped pack leaves nothing behind.
const plural = /* @__PURE__ */ new Intl.PluralRules('ro');

/** Romanian noun after a count: 1 fișier, 2–19 fișiere, 20+ de fișiere. */
const files = (n: number): string => {
  const form = plural.select(n);

  return `${n} ${form === 'one' ? 'fișier' : form === 'few' ? 'fișiere' : 'de fișiere'}`;
};

/** Romanian pack. */
export const MUD_LABELS_RO: MudLabels = {
  avatar: { initials: (i) => `Avatar pentru ${i}`, fallback: 'Avatar utilizator' },
  badge: { notification: 'Notificare' },
  banner: { close: 'Închide' },
  breadcrumb: { navigation: 'Fir de navigare', overflow: 'Arată paginile ascunse' },
  chip: { remove: (l) => `Elimină ${l}` },
  datePicker: {
    calendar: 'Calendar',
    previousMonth: 'Luna anterioară',
    nextMonth: 'Luna următoare',
    previousYear: 'Anul anterior',
    nextYear: 'Anul următor',
    chooseMonth: (m) => `${m}, alege luna`,
    chooseYear: (y) => `${y}, alege anul`,
    today: 'Azi',
    clear: 'Șterge',
    rangeStart: 'Data de început',
    rangeEnd: 'Data de sfârșit',
    formatHint: (pattern) => `Format dată: ${pattern}`,
    monthChanged: (monthYear) => monthYear,
    rangeStartSelected: (start) => `${start} selectată, alege data de sfârșit`,
    rangeSelected: (start, end) => `Interval selectat: de la ${start} până la ${end}`,
  },
  dialog: { close: 'Închide' },
  fileInput: {
    cta: 'Trage și plasează sau ',
    chooseFiles: 'Alege fișiere',
    dropzoneActive: 'Eliberează pentru a încărca',
    fileList: 'Fișiere selectate',
    required: 'obligatoriu',
    formats: (f) => `Formate acceptate: ${f.join(', ')}`,
    maxSize: (size) => `Mărime maximă: ${size}`,
    added: (names) =>
      names.length === 1
        ? `Fișierul ${names[0]} a fost adăugat.`
        : `${files(names.length)} au fost adăugate.`,
    removed: (name) => `Fișierul ${name} a fost eliminat.`,
    rejected: (name) => `Fișierul ${name} a fost respins.`,
  },
  fileItem: { remove: (f) => `Elimină fișierul ${f}`, cancel: (f) => `Anulează încărcarea ${f}` },
  fileSize: { units: ['B', 'KB', 'MB', 'GB', 'TB'] },
  infoBox: { close: 'Închide' },
  inputChip: {
    remove: (c) => `Elimină ${c}`,
    added: (chip) => `Valoarea ${chip} a fost adăugată.`,
    removed: (chip) => `Valoarea ${chip} a fost eliminată.`,
    rejectedPattern: (value) => `Valoarea "${value}" nu este în formatul așteptat.`,
    rejectedDuplicate: (value) => `Valoarea "${value}" este deja adăugată.`,
    rejectedMax: 'Numărul maxim de valori a fost atins.',
  },
  numericInput: { increment: 'Crește', decrement: 'Scade', clear: 'Șterge' },
  pagination: {
    navigation: 'Navigare pagini',
    previous: 'Anterior',
    next: 'Următor',
    previousAria: (page) => `Anterior, mergi la pagina ${page}`,
    nextAria: (page) => `Următor, mergi la pagina ${page}`,
    pageAria: (page, total) => `Pagina ${page} din ${total}`,
    overflowAria: (from, to) => `Arată paginile de la ${from} la ${to}`,
  },
  phoneInput: {
    clear: 'Șterge numărul',
    country: (n, d) => `Țară: ${n} ${d}`,
    countryList: 'Țară',
    countrySearch: 'Caută țara',
    countryEmpty: 'Nicio țară găsită',
  },
  searchInput: { submit: 'Caută', clear: 'Șterge' },
  selectInput: { options: 'Opțiuni', empty: 'Nicio opțiune', noResults: 'Niciun rezultat', loading: 'Se încarcă…' },
  spinner: { loading: 'Se încarcă' },
  stepper: { completed: 'finalizat', blocked: 'are erori' },
  table: { sort: 'Sortează' },
  textInput: { clear: 'Golește câmpul' },
  timePicker: {
    picker: 'Oră',
    openPicker: 'Deschide selectorul de oră',
    hours: 'Ore',
    minutes: 'Minute',
    clear: 'Șterge',
    formatHint: (pattern) => `Format oră: ${pattern}`,
  },
  toast: { close: 'Închide' },
  tooltip: { close: 'Închide tooltip-ul', coachHint: 'Apasă Esc pentru a închide.' },
};
