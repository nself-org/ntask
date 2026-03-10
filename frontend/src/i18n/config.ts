/**
 * i18n configuration
 *
 * Supported locales. Add new locale codes here and create a
 * corresponding messages/{locale}.json file.
 *
 * Usage in components:
 *   import { useTranslations } from 'next-intl';
 *   const t = useTranslations('todos');
 *   t('addTask') // => "Add a task"
 */

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Locale metadata for language pickers */
export const localeNames: Record<Locale, string> = {
  en: 'English',
};
