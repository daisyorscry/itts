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

export function toDatetimeLocal(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function getFirstErrorField(errors: Record<string, unknown>): string | null {
  const entries = Object.entries(errors);

  for (const [key, value] of entries) {
    if (!value) {
      continue;
    }

    if (typeof value === 'object' && value !== null && ('message' in value || 'type' in value)) {
      return key;
    }

    if (typeof value === 'object') {
      const nestedField = getFirstErrorField(value as Record<string, unknown>);
      if (nestedField) {
        return nestedField;
      }
    }
  }

  return null;
}
