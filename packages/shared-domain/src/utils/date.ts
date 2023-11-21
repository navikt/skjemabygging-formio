import moment from 'moment';

const dateAndTimeFormat: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

const dateFormat: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: '2-digit',
  year: 'numeric',
};

const toLocaleDateAndTime = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateAndTimeFormat);
const toLocaleDate = (date: string, locale = 'no') => new Date(date).toLocaleString(locale, dateFormat);

export const getIso8601String = () => {
  return moment().toISOString();
};

const dateUtils = {
  getIso8601String,
  toLocaleDateAndTime,
  toLocaleDate,
};

export default dateUtils;
