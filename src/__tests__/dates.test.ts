import { describe, expect, test } from '@jest/globals';
import {
  getLocalDateString,
  parseLocalDate,
  getGreeting,
  formatFriendlyDate,
  formatShortDate,
  formatDayMonth,
  getDaysAgo,
  getFilterStartDate,
  isSameDay,
  getNowISO,
} from '../utils/dates';

// ==========================================
// getLocalDateString
// ==========================================
describe('getLocalDateString', () => {
  test('formats current date as YYYY-MM-DD', () => {
    const result = getLocalDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('formats specific date', () => {
    const date = new Date(2026, 8, 5); // Sep 5, 2026 (month is 0-indexed)
    expect(getLocalDateString(date)).toBe('2026-09-05');
  });

  test('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 3); // Jan 3, 2026
    expect(getLocalDateString(date)).toBe('2026-01-03');
  });
});

// ==========================================
// parseLocalDate
// ==========================================
describe('parseLocalDate', () => {
  test('parses YYYY-MM-DD without timezone shift', () => {
    const date = parseLocalDate('2026-09-05');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8); // 0-indexed
    expect(date.getDate()).toBe(5);
  });

  test('round-trips with getLocalDateString', () => {
    const original = '2026-12-31';
    const parsed = parseLocalDate(original);
    const formatted = getLocalDateString(parsed);
    expect(formatted).toBe(original);
  });
});

// ==========================================
// getGreeting
// ==========================================
describe('getGreeting', () => {
  test('returns a Portuguese greeting', () => {
    const result = getGreeting();
    expect(['Bom dia', 'Boa tarde', 'Boa noite']).toContain(result);
  });
});

// ==========================================
// formatFriendlyDate
// ==========================================
describe('formatFriendlyDate', () => {
  test('formats date in Portuguese', () => {
    const result = formatFriendlyDate(new Date(2026, 8, 5)); // Sep 5, 2026 is a Saturday
    expect(result).toBe('Sábado, 5 de setembro');
  });

  test('formats another date', () => {
    const result = formatFriendlyDate(new Date(2026, 0, 1)); // Jan 1 Thursday
    expect(result).toBe('Quinta-feira, 1 de janeiro');
  });
});

// ==========================================
// formatShortDate
// ==========================================
describe('formatShortDate', () => {
  test('formats as DD/MM/YYYY', () => {
    expect(formatShortDate('2026-09-05')).toBe('05/09/2026');
  });

  test('handles single digit', () => {
    expect(formatShortDate('2026-01-03')).toBe('03/01/2026');
  });
});

// ==========================================
// formatDayMonth
// ==========================================
describe('formatDayMonth', () => {
  test('formats as DD/MM', () => {
    expect(formatDayMonth('2026-09-05')).toBe('05/09');
  });
});

// ==========================================
// getDaysAgo
// ==========================================
describe('getDaysAgo', () => {
  test('returns date N days ago', () => {
    const from = new Date(2026, 8, 10); // Sep 10
    expect(getDaysAgo(5, from)).toBe('2026-09-05');
  });

  test('crosses month boundary', () => {
    const from = new Date(2026, 8, 3); // Sep 3
    expect(getDaysAgo(5, from)).toBe('2026-08-29');
  });
});

// ==========================================
// getFilterStartDate
// ==========================================
describe('getFilterStartDate', () => {
  test('returns null for "all"', () => {
    expect(getFilterStartDate('all')).toBeNull();
  });

  test('returns a date string for valid filters', () => {
    const result = getFilterStartDate('7d');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('returns null for unknown filter', () => {
    expect(getFilterStartDate('unknown')).toBeNull();
  });
});

// ==========================================
// isSameDay
// ==========================================
describe('isSameDay', () => {
  test('same day returns true', () => {
    expect(isSameDay('2026-09-05', '2026-09-05')).toBe(true);
  });

  test('different day returns false', () => {
    expect(isSameDay('2026-09-05', '2026-09-06')).toBe(false);
  });
});

// ==========================================
// getNowISO
// ==========================================
describe('getNowISO', () => {
  test('returns ISO string', () => {
    const result = getNowISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
