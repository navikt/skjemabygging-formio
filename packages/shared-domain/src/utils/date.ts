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
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
};

const toLocaleDateAndTime = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateAndTimeFormat);
const toLocaleDate = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateFormat);
const toWeekdayAndDate = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, weekdayAndDateFormat);

export const getIso8601String = () => {
  return moment().toISOString();
};

const dateUtils = {
  getIso8601String,
  toLocaleDateAndTime,
  toLocaleDate,
  toWeekdayAndDate,
};

export default dateUtils;
