import moment from 'moment/moment';

moment.parseTwoDigitYear = function (yearString) {
  const lastTwoDigits = parseInt(yearString);
  return lastTwoDigits + (lastTwoDigits > 55 ? 1900 : 2000);
};
