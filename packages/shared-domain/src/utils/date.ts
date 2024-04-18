import { DateTime } from 'luxon';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

interface WeeklyPeriod {
  periodFrom: Date;
  periodTo: Date;
  id: string;
}

const defaultTimeZone = 'Europe/Oslo';

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
  timeZone: defaultTimeZone,
};

const weekdayAndDateFormat: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  timeZone: defaultTimeZone,
};

const longMonthDateFormat: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: defaultTimeZone,
};

const toLocaleDateAndTime = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateAndTimeFormat);

const toLocaleDate = (date: string, locale = 'no') => {
  return DateTime.fromISO(date, { zone: defaultTimeZone }).setLocale(locale).toLocaleString(dateFormat);
};

const toWeekdayAndDate = (date: string, locale = 'no') => {
  return DateTime.fromISO(date, { zone: defaultTimeZone }).setLocale(locale).toLocaleString(weekdayAndDateFormat);
};

const toLocaleDateLongMonth = (date: string, locale = 'no') => {
  return DateTime.fromISO(date, { zone: defaultTimeZone }).setLocale(locale).toLocaleString(longMonthDateFormat);
};

export const getIso8601String = () => {
  return moment().toISOString();
};

const getDatesInRange = (start: string, end: string) => {
  const startDate = DateTime.fromISO(start, { zone: defaultTimeZone });
  const endDate = DateTime.fromISO(end, { zone: defaultTimeZone });
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
  const today = DateTime.now().setZone(defaultTimeZone).startOf('day');

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

    periods.push({ periodFrom: startDate.toJSDate(), periodTo: endDate.toJSDate(), id: uuidv4() });
  }

  return periods;
};

const dateUtils = {
  getIso8601String,
  toLocaleDateAndTime,
  toLocaleDate,
  toWeekdayAndDate,
  getDatesInRange,
  toLocaleDateLongMonth,
  generateWeeklyPeriods,
};

export default dateUtils;
