import { fnr as fnrvalidator } from '@navikt/fnrvalidator';
import moment from 'moment/moment';
import { dataFetcherUtils } from '../data-fetcher';
import sanitizeJavaScriptCode from './sanitize-javascript-code';

const getCustomUtils = (Utils) => {
  const isBornBeforeYear = (year, fnrOrDateKey, submission = {}) => {
    const birthDate = getBirthDate(fnrOrDateKey, submission);
    return birthDate ? birthDate.year() < year : false;
  };

  const isAgeBetween = (ageInterval, fnrOrDateKey, submission = {}, pointInTime = moment()) => {
    const age = getAge(fnrOrDateKey, submission, pointInTime);
    if (age) {
      const [min, max] = ageInterval;
      return min <= age && age <= max;
    }
    return false;
  };

  const getAge = (fnrOrDateKey, submission = {}, pointInTime = moment()) => {
    const birthDate = getBirthDate(fnrOrDateKey, submission);
    if (birthDate) {
      return pointInTime.diff(birthDate, 'years', false);
    }
    return undefined;
  };

  const getBirthDate = (fnrOrDateKey, submission = {}) => {
    const submissionValue = Utils.getValue(submission, fnrOrDateKey);
    if (typeof submissionValue !== 'string') {
      return undefined;
    }

    const value = submissionValue.trim();
    if (moment(submissionValue, 'YYYY-MM-DD', true).isValid()) {
      return moment(submissionValue, 'YYYY-MM-DD');
    }
    if (value && fnrvalidator(value).status === 'valid') {
      return getBirthDateFromFnr(value);
    }
    return undefined;
  };

  const getBirthDateFromFnr = (fnr) => {
    let year = parseInt(fnr.substring(4, 6));
    if (parseInt(fnr.substring(6)) < 10) {
      // stillborn
      return undefined;
    } else {
      const individnr = parseInt(fnr.substring(6, 9));
      if (individnr < 500) {
        year += 1900;
      } else if (individnr < 750 && 54 < year) {
        year += 1800;
      } else if (individnr < 1000 && year < 40) {
        year += 2000;
      } else if (900 <= individnr && individnr < 1000 && 39 < year) {
        year += 1900;
      } else {
        // unable to derive birth year
        return undefined;
      }
    }
    const birthDateStr = `${fnr.substring(0, 4)}${year}`;
    return moment(birthDateStr, 'DDMMYYYY');
  };

  return {
    sanitizeJavaScriptCode,
    isBornBeforeYear,
    isAgeBetween,
    getAge,
    dataFetcher: dataFetcherUtils.dataFetcher,
  };
};

export default getCustomUtils;
