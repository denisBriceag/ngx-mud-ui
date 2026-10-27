import type { MudLabels } from './mud-labels';

// Not in upstream — needs native-speaker review: datePicker.calendar, datePicker.previousMonth, datePicker.nextMonth,
// datePicker.previousYear, datePicker.nextYear, datePicker.chooseMonth, datePicker.chooseYear, datePicker.rangeStart,
// datePicker.rangeEnd, datePicker.formatHint, datePicker.rangeStartSelected, datePicker.rangeSelected,
// fileInput.fileList, fileInput.required, fileInput.rejected, fileItem.cancel, inputChip.rejectedMax,
// pagination.previousAria, pagination.nextAria (reworded for label-in-name), phoneInput.country, selectInput.noResults,
// stepper.blocked, table.sort, timePicker.picker, timePicker.formatHint
// Also confirm: fileInput.chooseFiles ('выберите файлы' is lower case for the inline link after the cta; it also labels the
// button variant). timePicker.picker: upstream has 'Выбрать время' as an alternative to the current 'Время'.

// Pure annotation: a dropped pack leaves nothing behind.
const plural = /* @__PURE__ */ new Intl.PluralRules('ru');

/** Russian "added N files" phrase: 1 файл, 2–4 файла, 5+ файлов. */
const added = (n: number): string => {
  const form = plural.select(n);

  if (form === 'one') return `Добавлен ${n} файл.`;

  if (form === 'few') return `Добавлено ${n} файла.`;

  return `Добавлено ${n} файлов.`;
};

/** Russian pack. */
export const MUD_LABELS_RU: MudLabels = {
  avatar: { initials: (i) => `Аватар для ${i}`, fallback: 'Аватар пользователя' },
  badge: { notification: 'Уведомление' },
  banner: { close: 'Закрыть' },
  breadcrumb: { navigation: 'Хлебные крошки', overflow: 'Показать скрытые страницы' },
  chip: { remove: (l) => `Удалить ${l}` },
  datePicker: {
    calendar: 'Календарь',
    previousMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    previousYear: 'Предыдущий год',
    nextYear: 'Следующий год',
    chooseMonth: (m) => `${m}, выбрать месяц`,
    chooseYear: (y) => `${y}, выбрать год`,
    today: 'Сегодня',
    clear: 'Очистить',
    rangeStart: 'Дата начала',
    rangeEnd: 'Дата окончания',
    formatHint: (pattern) => `Формат даты: ${pattern}`,
    monthChanged: (monthYear) => monthYear,
    rangeStartSelected: (start) => `Выбрана дата ${start}, выберите дату окончания`,
    rangeSelected: (start, end) => `Выбран период: с ${start} по ${end}`,
  },
  dialog: { close: 'Закрыть' },
  fileInput: {
    cta: 'Перетащите или ',
    chooseFiles: 'выберите файлы',
    dropzoneActive: 'Отпустите, чтобы загрузить',
    fileList: 'Выбранные файлы',
    required: 'обязательно',
    formats: (f) => `Допустимые форматы: ${f.join(', ')}`,
    maxSize: (size) => `Максимальный размер: ${size}`,
    added: (names) => (names.length === 1 ? `Файл ${names[0]} добавлен.` : added(names.length)),
    removed: (name) => `Файл ${name} удалён.`,
    rejected: (name) => `Файл ${name} отклонён.`,
  },
  fileItem: { remove: (f) => `Удалить файл ${f}`, cancel: (f) => `Отменить загрузку ${f}` },
  fileSize: { units: ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'] },
  infoBox: { close: 'Закрыть' },
  inputChip: {
    remove: (c) => `Удалить ${c}`,
    added: (chip) => `Значение ${chip} добавлено.`,
    removed: (chip) => `Значение ${chip} удалено.`,
    rejectedPattern: (value) => `Значение «${value}» не соответствует ожидаемому формату.`,
    rejectedDuplicate: (value) => `Значение «${value}» уже добавлено.`,
    rejectedMax: 'Достигнуто максимальное количество значений.',
  },
  numericInput: { increment: 'Увеличить', decrement: 'Уменьшить', clear: 'Очистить' },
  pagination: {
    navigation: 'Навигация по страницам',
    previous: 'Назад',
    next: 'Далее',
    previousAria: (page) => `Назад, перейти на страницу ${page}`,
    nextAria: (page) => `Далее, перейти на страницу ${page}`,
    pageAria: (page, total) => `Страница ${page} из ${total}`,
    overflowAria: (from, to) => `Показать страницы с ${from} по ${to}`,
  },
  phoneInput: {
    clear: 'Очистить номер',
    country: (n, d) => `Страна: ${n} ${d}`,
    countryList: 'Страна',
    countrySearch: 'Поиск страны',
    countryEmpty: 'Страна не найдена',
  },
  searchInput: { submit: 'Поиск', clear: 'Очистить' },
  selectInput: { options: 'Варианты', empty: 'Нет вариантов', noResults: 'Ничего не найдено', loading: 'Загрузка…' },
  spinner: { loading: 'Загрузка' },
  stepper: { completed: 'завершено', blocked: 'есть ошибки' },
  table: { sort: 'Сортировать' },
  textInput: { clear: 'Очистить поле' },
  timePicker: {
    picker: 'Время',
    openPicker: 'Открыть выбор времени',
    hours: 'Часы',
    minutes: 'Минуты',
    clear: 'Очистить',
    formatHint: (pattern) => `Формат времени: ${pattern}`,
  },
  toast: { close: 'Закрыть' },
  tooltip: { close: 'Закрыть подсказку', coachHint: 'Нажмите Esc, чтобы закрыть.' },
};
