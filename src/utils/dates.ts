// ==========================================
// CutTrack — Date Utilities
// ==========================================

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string as a local date (avoiding timezone shifts).
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get greeting based on current hour.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Format date as friendly string: "Sábado, 5 de setembro"
 */
export function formatFriendlyDate(date: Date = new Date()): string {
  const weekdays = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado',
  ];
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];

  const weekday = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${weekday}, ${day} de ${month}`;
}

/**
 * Format date as DD/MM/YYYY.
 */
export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date as DD/MM.
 */
export function formatDayMonth(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Get the date N days ago as YYYY-MM-DD.
 */
export function getDaysAgo(days: number, from: Date = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return getLocalDateString(date);
}

/**
 * Get the start date for a time filter.
 */
export function getFilterStartDate(filter: string): string | null {
  switch (filter) {
    case '7d': return getDaysAgo(7);
    case '30d': return getDaysAgo(30);
    case '3m': return getDaysAgo(90);
    case '6m': return getDaysAgo(180);
    case '1y': return getDaysAgo(365);
    case 'all': return null;
    default: return null;
  }
}

/**
 * Format time string HH:mm to display format.
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Check if two date strings represent the same day.
 */
export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 === dateStr2;
}

/**
 * Get ISO string for current timestamp.
 */
export function getNowISO(): string {
  return new Date().toISOString();
}
