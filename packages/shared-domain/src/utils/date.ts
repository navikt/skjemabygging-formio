import { DateTime, DurationObjectUnits } from 'luxon';
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

const validMonthInputFormats = ['MM.yyyy', 'MM/yyyy', 'MM-yyyy', 'MM yyyy', 'MMMM yyyy', 'MMM yyyy'];
const submissionFormatMonth = 'yyyy-MM';
const inputFormatMonthLong = 'MMMM yyyy';

const toLocaleDateAndTime = (date: string, locale = 'no') =>
  DateTime.fromISO(date).setLocale(locale).toLocaleString(dateAndTimeFormat);

const toLocaleDate = (date?: string, locale = 'no') => {
  if (date) {
    return DateTime.fromISO(date).setLocale(locale).toLocaleString(dateFormat);
  } else {
    return DateTime.now().setLocale(locale).toLocaleString(dateFormat);
  }
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

const toLongMonthFormat = (date?: string, locale: string = 'nb-NO') => {
  return (
    date && DateTime.fromFormat(date, submissionFormatMonth, { locale }).toFormat(inputFormatMonthLong, { locale })
  );
};

const toJSDateFromMonthSubmission = (date?: string) => {
  if (!date) return;
  return DateTime.fromFormat(date, submissionFormatMonth).toJSDate();
};

const findUsedInputFormat = (date?: string, locale: string = 'nb-NO') => {
  if (!date) return;
  return validMonthInputFormats.find((format) => DateTime.fromFormat(date, format, { locale }).isValid);
};

const isValidInputMonth = (date?: string, locale: string = 'nb-NO') => {
  if (!date) return false;
  const usedInputFormat = findUsedInputFormat(date, locale);
  if (!usedInputFormat) return false;
  return DateTime.fromFormat(date, usedInputFormat, { locale })?.isValid;
};

const isValidMonthSubmission = (date?: string) => {
  if (!date) return false;
  return DateTime.fromFormat(date, submissionFormatMonth)?.isValid;
};

const startOfYear = (year: string) => {
  return DateTime.fromFormat(year, 'yyyy').startOf('year');
};

const endOfYear = (year: string) => {
  return DateTime.fromFormat(year, 'yyyy').endOf('year');
};

const toSubmissionDateMonth = (date?: string, locale: string = 'nb-NO') => {
  if (!date) return '';

  // ISO from onMonthChange
  if (DateTime.fromISO(date).isValid) {
    return DateTime.fromISO(date).toFormat(submissionFormatMonth);
  } else if (isValidInputMonth(date)) {
    // Month input from input field
    const usedInputFormat = findUsedInputFormat(date);
    if (!usedInputFormat) return '';
    return DateTime.fromFormat(date, usedInputFormat, { locale }).toFormat(submissionFormatMonth);
  } else {
    return '';
  }
};

const toCurrentDayMonthYearHourMinute = (language: string): string => {
  const now = new Date();
  const timeZone = 'Europe/Oslo';

  const formatter = new Intl.DateTimeFormat(language, {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const day = parts.find((p) => p.type === 'day')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const year = parts.find((p) => p.type === 'year')?.value;
  const hour = parts.find((p) => p.type === 'hour')?.value;
  const minute = parts.find((p) => p.type === 'minute')?.value;

  return `${day} ${month} ${year}, ${hour}:${minute}`;
};

const toJSDate = (date: string) => {
  return DateTime.fromISO(date).toJSDate();
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

const getDefaultDateFromRange = (fromDate?: string, toDate?: string): Date | undefined => {
  const now = DateTime.now().toString();
  if (!fromDate || !toDate || isBeforeDate(toDate, fromDate)) {
    return undefined;
  }

  if (isBeforeDate(toDate, now)) {
    return toJSDate(toDate);
  }
  if (isAfterDate(fromDate, now)) {
    return toJSDate(fromDate);
  }
  return toJSDate(now);
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

const add = (unit: keyof DurationObjectUnits, duration: number, isoDate?: string): string | null => {
  let date: DateTime;
  if (!isoDate) {
    date = DateTime.now();
  } else {
    date = DateTime.fromISO(isoDate);
  }

  return date.plus({ [unit]: duration }).toISO();
};

const min = (dates: string[]) => {
  return DateTime.min(...dates.map((date: string) => DateTime.fromISO(date)))?.toFormat(submissionFormat);
};

const isValid = (date: string, format: 'input' | 'submission') => {
  return date && DateTime.fromFormat(date, format === 'input' ? inputFormat : submissionFormat)?.isValid;
};

const isBeforeDate = (date1: string, date2: string) => {
  return DateTime.fromISO(date1).startOf('day') < DateTime.fromISO(date2).startOf('day');
};

const isAfterDate = (date1: string, date2: string) => {
  return DateTime.fromISO(date1).startOf('day') > DateTime.fromISO(date2).startOf('day');
};

const isAfter = (date1: string, date2: string) => {
  const d1 = DateTime.fromISO(date1);
  const d2 = DateTime.fromISO(date2);
  if (d1.isValid && d2.isValid) {
    return d1 > d2;
  }
  return d1.isValid;
};

const isBefore = (date1: string, date2: string) => {
  const d1 = DateTime.fromISO(date1);
  const d2 = DateTime.fromISO(date2);
  if (d1.isValid && d2.isValid) {
    return d1 < d2;
  }
  return d1.isValid;
};

const formatUnixEpochSecondsToLocalTime = (unixEpoxSeconds: number, locale = 'no') => {
  return DateTime.fromSeconds(unixEpoxSeconds, { zone: 'local' }).setLocale(locale).toFormat('HH.mm');
};

const dateUtils = {
  getIso8601String,
  toLocaleDateAndTime,
  toLocaleDate,
  toSubmissionDate,
  toJSDate,
  toWeekdayAndDate,
  getDatesInRange,
  getDefaultDateFromRange,
  toLocaleDateLongMonth,
  toCurrentDayMonthYearHourMinute,
  formatUnixEpochSecondsToLocalTime,
  generateWeeklyPeriods,
  add,
  addDays,
  min,
  isValid,
  isBeforeDate,
  isValidInputMonth,
  toLongMonthFormat,
  toSubmissionDateMonth,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
  isAfterDate,
  isValidMonthSubmission,
  toJSDateFromMonthSubmission,
  findUsedInputFormat,
  inputFormat,
};

export default dateUtils;
