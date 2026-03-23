const DEFAULT_LOCALE = 'en-US';

type DateInput = string | number | Date;
type NullableDateInput = DateInput | null | undefined;

export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale = DEFAULT_LOCALE,
) {
  return new Date(value).toLocaleDateString(locale, options);
}

export function formatDateTime(
  value: DateInput,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  locale = DEFAULT_LOCALE,
) {
  return new Date(value).toLocaleString(locale, options);
}

export function formatOptionalDate(
  value: NullableDateInput,
  fallback = '-',
  options?: Intl.DateTimeFormatOptions,
  locale = DEFAULT_LOCALE,
) {
  if (!value) {
    return fallback;
  }

  return formatDate(value, options, locale);
}

export function formatLastLoginDate(value: NullableDateInput) {
  return formatOptionalDate(
    value,
    'Never',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  );
}
