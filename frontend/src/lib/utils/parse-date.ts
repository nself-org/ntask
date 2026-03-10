/**
 * Lightweight natural language date parser using date-fns.
 * Supports: today, tomorrow, yesterday, next <weekday>, in <N> days/weeks, <weekday>
 */
import {
  addDays,
  addWeeks,
  nextDay,
  format,
  isValid,
  parse,
  startOfDay,
} from 'date-fns';

const WEEKDAYS: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

/**
 * Parse a natural language date string and return a YYYY-MM-DD string, or null.
 */
export function parseNaturalDate(input: string): string | null {
  const s = input.trim().toLowerCase();
  const now = startOfDay(new Date());

  if (s === 'today' || s === 'tod') return format(now, 'yyyy-MM-dd');
  if (s === 'tomorrow' || s === 'tmr' || s === 'tom') return format(addDays(now, 1), 'yyyy-MM-dd');
  if (s === 'yesterday') return format(addDays(now, -1), 'yyyy-MM-dd');
  if (s === 'next week' || s === 'nextweek') return format(addWeeks(now, 1), 'yyyy-MM-dd');
  if (s === 'in a week') return format(addWeeks(now, 1), 'yyyy-MM-dd');

  // "in N days" / "in N weeks"
  const inDays = s.match(/^in\s+(\d+)\s+(day|days)$/);
  if (inDays) return format(addDays(now, parseInt(inDays[1])), 'yyyy-MM-dd');
  const inWeeks = s.match(/^in\s+(\d+)\s+(week|weeks)$/);
  if (inWeeks) return format(addWeeks(now, parseInt(inWeeks[1])), 'yyyy-MM-dd');

  // "next <weekday>" or bare "<weekday>"
  const nextMatch = s.match(/^(?:next\s+)?(\w+)$/);
  if (nextMatch) {
    const day = WEEKDAYS[nextMatch[1]];
    if (day !== undefined) {
      const next = nextDay(now, day);
      return format(next, 'yyyy-MM-dd');
    }
  }

  // ISO format YYYY-MM-DD
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = parse(s, 'yyyy-MM-dd', now);
    if (isValid(d)) return s;
  }

  // M/D or M/D/YY or M/D/YYYY
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slash) {
    const year = slash[3]
      ? slash[3].length === 2
        ? `20${slash[3]}`
        : slash[3]
      : String(now.getFullYear());
    const candidate = `${year}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`;
    const d = parse(candidate, 'yyyy-MM-dd', now);
    if (isValid(d)) return candidate;
  }

  return null;
}

/**
 * Extract a date expression from quick-add text.
 * Looks for patterns like "by tomorrow", "due friday", "on monday", or bare date words.
 * Returns { title: cleaned text, dueDate: YYYY-MM-DD | null }
 */
export function extractDueDate(text: string): { title: string; dueDate: string | null } {
  const patterns = [
    /\s+(?:by|due|on)\s+([\w\s/\-]+?)(?:\s+!|\s*$)/i,
    /\s+(today|tomorrow|tmr|tom|yesterday|next\s+week|next\s+\w+|in\s+\d+\s+\w+|\w+day)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const candidate = match[1].trim();
      const parsed = parseNaturalDate(candidate);
      if (parsed) {
        const title = text.replace(match[0], '').trim();
        return { title, dueDate: parsed };
      }
    }
  }

  return { title: text, dueDate: null };
}
