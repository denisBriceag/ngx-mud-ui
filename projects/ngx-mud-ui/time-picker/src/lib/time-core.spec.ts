import {
  formatTime,
  isSelectable,
  isValidTime,
  isWithin,
  minuteStepTransform,
  minuteOfDay,
  minutesForStep,
  parseTime,
  toMinuteStep,
  toValidTimeOrUndefined,
} from './time-core';
import type { MudTimeFilter } from './time-core';

describe('time-core', () => {
  it('parses strict 24-hour HH:MM', () => {
    expect(parseTime('09:05')).toEqual({ hours: 9, minutes: 5 });
    expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 });
    expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0 });
  });

  it('rejects anything that is not zero-padded HH:MM within range', () => {
    const bad = ['24:00', '23:60', '9:05', '09:5', '0905', '', ' 09:05', '09:05:00', null, undefined];

    for (const value of bad) {
      expect(parseTime(value as string)).toBeNull();
      expect(isValidTime(value)).toBe(false);
    }

    expect(isValidTime(905)).toBe(false);
  });

  it('formats zero-padded', () => {
    expect(formatTime(9, 5)).toBe('09:05');
    expect(formatTime(0, 0)).toBe('00:00');
    expect(formatTime(23, 59)).toBe('23:59');
  });

  it('computes minutes since midnight', () => {
    expect(minuteOfDay('01:30')).toBe(90);
    expect(minuteOfDay('00:00')).toBe(0);
    expect(minuteOfDay('nope')).toBeNull();
    expect(minuteOfDay(undefined)).toBeNull();
  });

  it('bounds inclusively and ignores a malformed bound', () => {
    expect(isWithin('09:00', '09:00', '17:00')).toBe(true);
    expect(isWithin('17:00', '09:00', '17:00')).toBe(true);
    expect(isWithin('08:59', '09:00', undefined)).toBe(false);
    expect(isWithin('17:01', undefined, '17:00')).toBe(false);
    expect(isWithin('12:00', 'nope', '17:00')).toBe(true);
    expect(isWithin('12:00')).toBe(true);
    expect(isWithin('bad')).toBe(false);
  });

  it('normalizes a bound to a valid time or undefined', () => {
    expect(toValidTimeOrUndefined('09:00')).toBe('09:00');
    expect(toValidTimeOrUndefined('9:00')).toBeUndefined();
    expect(toValidTimeOrUndefined(undefined)).toBeUndefined();
  });

  it('normalizes a minute step', () => {
    expect(toMinuteStep(15)).toBe(15);
    expect(toMinuteStep('15')).toBe(15);
    expect(toMinuteStep(7)).toBe(1);
    expect(toMinuteStep(undefined)).toBe(1);
    expect(toMinuteStep(null)).toBe(1);
  });

  it('lists the minutes a step renders', () => {
    expect(minutesForStep(1)).toHaveLength(60);
    expect(minutesForStep(15)).toEqual([0, 15, 30, 45]);
    expect(minutesForStep(30)).toEqual([0, 30]);
  });

  it('isSelectable applies bounds, then step, then filter', () => {
    expect(isSelectable('09:15', {})).toBe(true);
    expect(isSelectable('9:15', {})).toBe(false);
    expect(isSelectable('08:59', { min: '09:00' })).toBe(false);
    expect(isSelectable('09:07', { minuteStep: 15 })).toBe(false);
    expect(isSelectable('09:45', { minuteStep: 15 })).toBe(true);
    expect(isSelectable('12:30', { timeFilter: (t) => !t.startsWith('12') })).toBe(false);
    expect(isSelectable('13:00', { timeFilter: (t) => !t.startsWith('12') })).toBe(true);
    // Parity with dateFilter: only an explicit `false` refuses.
    expect(isSelectable('13:00', { timeFilter: (() => undefined) as unknown as MudTimeFilter })).toBe(true);
  });

  it('minuteStepTransform normalizes and warns only about a real unlisted value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const transform = minuteStepTransform('mud-test');

    expect(transform(15)).toBe(15);
    expect(transform('15')).toBe(15);
    expect(transform(undefined)).toBe(1);
    expect(transform(null)).toBe(1);
    expect(warn).not.toHaveBeenCalled();

    expect(transform(7)).toBe(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[mud-test] minuteStep 7'));

    warn.mockRestore();
  });
});
