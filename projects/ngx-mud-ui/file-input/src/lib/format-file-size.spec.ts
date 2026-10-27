import { MUD_LABELS_EN, MUD_LABELS_RU } from 'ngx-mud-ui/i18n';
import { formatFileSize } from './format-file-size';

describe('formatFileSize', () => {
  it('file sizes use the format locale and unit labels', () => {
    const en = MUD_LABELS_EN.fileSize.units;

    expect(formatFileSize(1572864, 'ro-MD', en)).toBe('1,5 MB');
    expect(formatFileSize(1572864, 'en-US', en)).toBe('1.5 MB');
    expect(formatFileSize(1572864, 'ru-RU', MUD_LABELS_RU.fileSize!.units!)).toBe('1,5 МБ');
  });

  it('keeps the byte boundaries ungrouped and trims a trailing zero', () => {
    const en = MUD_LABELS_EN.fileSize.units;

    expect(formatFileSize(0, 'en-US', en)).toBe('0 B');
    expect(formatFileSize(1023, 'en-US', en)).toBe('1023 B');
    expect(formatFileSize(1024, 'en-US', en)).toBe('1 KB');
    expect(formatFileSize(5 * 1024 ** 3, 'en-US', en)).toBe('5 GB');
    expect(formatFileSize(5 * 1024 ** 5, 'en-US', en)).toBe('5120 TB');
  });

  it('treats negative and non-finite sizes as zero bytes', () => {
    const en = MUD_LABELS_EN.fileSize.units;

    expect(formatFileSize(-5, 'en-US', en)).toBe('0 B');
    expect(formatFileSize(Number.NaN, 'en-US', en)).toBe('0 B');
  });

  it('the item policy keeps fixed decimals (1 for KB/MB, 2 for GB) and caps at GB, in the locale', () => {
    const en = MUD_LABELS_EN.fileSize.units;

    expect(formatFileSize(512, 'en-US', en, 'item')).toBe('512 B');
    expect(formatFileSize(2048, 'en-US', en, 'item')).toBe('2.0 KB');
    expect(formatFileSize(2048, 'ro-MD', en, 'item')).toBe('2,0 KB');
    expect(formatFileSize(1.25 * 1024 ** 3, 'en-US', en, 'item')).toBe('1.25 GB');
    expect(formatFileSize(2048 * 1024 ** 3, 'en-US', en, 'item')).toBe('2048.00 GB');
    expect(formatFileSize(2048, 'en-US', en)).toBe('2 KB');
  });
});
