import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

interface WeeklyPeriod {
  periodFrom: string;
  periodTo: string;
  id: string;
}

const dateAndTimeFormat: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

const dateFormat: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

const weekdayAndDateFormat: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: '2-digit',
};

const longMonthDateFormat: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
};

const inputFormat = 'dd.MM.yyyy';
const submissionFormat = 'yyyy-MM-dd';

const toLocaleDateAndTime = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateAndTimeFormat);

const toLocaleDate = (date: string, locale = 'no') => {
  return DateTime.fromISO(date).setLocale(locale).toLocaleString(dateFormat);
};

const toWeekdayAndDate = (date: string, locale = 'no') => {
  return DateTime.fromISO(date).setLocale(locale).toLocaleString(weekdayAndDateFormat);
};

const toLocaleDateLongMonth = (date: string, locale = 'no') => {
  return DateTime.fromISO(date).setLocale(locale).toLocaleString(longMonthDateFormat);
};

const toSubmissionDate = (date?: string) => {
  if (date) {
    return DateTime.fromFormat(date, inputFormat).toFormat(submissionFormat);
  } else {
    return DateTime.now().toFormat(submissionFormat);
  }
};

export const getIso8601String = () => {
  return DateTime.utc().toISO();
};

const getDatesInRange = (start: string, end: string) => {
  const startDate = DateTime.fromISO(start);
  const endDate = DateTime.fromISO(end);
  const dates: string[] = [];

  let currentDate = startDate;

  while (currentDate <= endDate) {
    if (currentDate.isValid) {
      dates.push(currentDate.toISODate());
      currentDate = currentDate.plus({ days: 1 });
    }
  }

  return dates;
};

export const generateWeeklyPeriods = (date?: string, numberOfPeriods: number = 1): WeeklyPeriod[] => {
  if (!date) return [];

  const periods: WeeklyPeriod[] = [];
  const today = DateTime.now().startOf('day');

  for (let i = 0; i < numberOfPeriods; i++) {
    let startDate = DateTime.fromISO(date);
    let endDate = DateTime.fromISO(date);

    startDate = startDate.startOf('week').plus({ weeks: i });
    endDate = endDate
      .startOf('week')
      .plus({ weeks: i + 1 })
      .minus({ days: 1 });

    if (i === 0) {
      startDate = DateTime.fromISO(date);
    }

    if (endDate > today) {
      endDate = today;
    }

    if (startDate.isValid && endDate.isValid) {
      periods.push({ periodFrom: startDate.toISODate(), periodTo: endDate.toISODate(), id: uuidv4() });
    }
  }

  return periods;
};

const addDays = (days: number, isoDate?: string): string => {
  let date: DateTime;
  if (!isoDate) {
    date = DateTime.now();
  } else {
    date = DateTime.fromISO(isoDate);
  }

  return date.plus({ days }).toFormat(submissionFormat);
};

const min = (dates: string[]) => {
  return DateTime.min(...dates.map((date: string) => DateTime.fromISO(date)))?.toFormat(submissionFormat);
};

const isValid = (date: string, format: 'input' | 'submission') => {
  return date && DateTime.fromFormat(date, format === 'input' ? inputFormat : submissionFormat)?.isValid;
};

const isBeforeDate = (date1: string, date2: string, equal: boolean = true) => {
  if (equal) {
    return DateTime.fromISO(date1).startOf('day') < DateTime.fromISO(date2).startOf('day');
  } else {
    return DateTime.fromISO(date1).startOf('day') <= DateTime.fromISO(date2).startOf('day');
  }
};

const dateUtils = {
  getIso8601String,
  toLocaleDateAndTime,
  toLocaleDate,
  toSubmissionDate,
  toWeekdayAndDate,
  getDatesInRange,
  toLocaleDateLongMonth,
  generateWeeklyPeriods,
  addDays,
  min,
  isValid,
  isBeforeDate,
};

export default dateUtils;
