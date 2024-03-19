import moment from 'moment';

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

const toLocaleDateAndTime = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateAndTimeFormat);
const toLocaleDate = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateFormat);
const toWeekdayAndDate = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, weekdayAndDateFormat);
const toLocaleDateLongMonth = (date: string, locale = 'no') =>
  new Date(date).toLocaleString(locale, longMonthDateFormat);

export const getIso8601String = () => {
  return moment().toISOString();
};

const getDatesInRange = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const dateUtils = {
  getIso8601String,
  toLocaleDateAndTime,
  toLocaleDate,
  toWeekdayAndDate,
  getDatesInRange,
  toLocaleDateLongMonth,
};

export default dateUtils;
