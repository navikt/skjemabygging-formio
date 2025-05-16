import { fnr as fnrvalidator } from '@navikt/fnrvalidator';
import { formDiffingTool, navFormioUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Formio, Utils } from 'formiojs';
import moment from 'moment/moment';

const translateHTMLTemplate = (template, translate) => {
  return translate(template);
};

const navFormDiffToHtml = (diffSummary) => {
  try {
    const { changesToCurrentComponent, deletedComponents } = diffSummary;
    const html = [];
    if (changesToCurrentComponent.length) {
      const labelId = 'nav-form-diff-changed-elements';
      html.push(`<span id="${labelId}" class="navds-body-short font-bold">Endringer</span>`);
      html.push(`<ul aria-labelledby="${labelId}">`);
      html.push(
        ...changesToCurrentComponent.map(
          (change) => `<li>${change.key}: Fra '${change.oldValue}' til '${change.newValue}'</li>`,
        ),
      );
      html.push('</ul>');
    }
    if (deletedComponents.length) {
      const labelId = 'nav-form-diff-deleted-elements';
      html.push(`<span id="${labelId}" class="navds-body-short font-bold">Slettede elementer</span>`);
      html.push(createList(deletedComponents, labelId));
    }
    return html.join('');
  } catch (err) {
    console.error(`Failed to render form diff: ${err.message} diffSummery="${JSON.stringify(diffSummary)}"`, err);
    return '<span>Det oppstod dessverre en feil under behandling av endringene i dette skjemaet.</span>';
  }
};

const createList = (components, labelId) => {
  if (components && components.length > 0) {
    const labelledBy = labelId ? ` aria-labelledby="${labelId}"` : '';
    return `<ul${labelledBy}>`
      .concat(
        components
          .map((component) => {
            return `<li>${component.type}: ${component.label}${createList(component.components)}</li>`;
          })
          .join(''),
      )
      .concat('</ul>');
  }
  return '';
};

const TAG = (text) =>
  `<span class="navds-tag navds-tag--warning navds-tag--xsmall navds-detail navds-detail--small" data-testid="diff-tag">${text}</span>`;

const getDiffTag = (ctx) => {
  const { component, config, self } = ctx;
  const { publishedForm } = config;
  if (ctx.builder && publishedForm) {
    // Formio.js invokes mergeSchema on component which is put on ctx object. Therefore we must do the same
    // prior to comparing with published version to avoid misleading diff tags due to changes in a component's schema.
    const mergeSchema = self.mergeSchema.bind(self);
    const diff = formDiffingTool.getComponentDiff(component, publishedForm, mergeSchema);
    const tags = [];
    if (diff.isNew) {
      tags.push(`${TAG('Ny')}`);
    }
    if (diff.changesToCurrentComponent?.length) {
      tags.push(`${TAG('Endring')}`);
    }
    if (diff.deletedComponents?.length) {
      tags.push(`${TAG('Slettede elementer')}`);
    }
    return tags.join(' ');
  }
  return '';
};

/*
 * This function is overridden because FormioUtils.sanitize calls dompurify.sanitize, which has a bug.
 * The bug is discussed here: https://github.com/cure53/DOMPurify/issues/276
 * In short, it reverses the order of attributes on HTML elements.
 *
 * For us, this breaks translations, as the text to be translated no longer matches the text in the translation file.
 *
 * By calling the sanitize-function twice, we reverse the reversed order, causing the original, correct order.
 * This is messy, but we consider it safer than turning off sanitizing by sending in "sanitize = false" to NavForm.
 */
const originalSanitize = Utils.sanitize;
const sanitize = (string, options) => {
  return originalSanitize(originalSanitize(string, options), options);
};

const originalEvaluate = Utils.evaluate;

const evaluate = (func, args, ret, tokenize) => {
  return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
};

const { sanitizeJavaScriptCode } = navFormioUtils;

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

const getSelectedItems = (items, userData) => items.filter((item) => userData[item.value]);

const getMatchingItems = (items, matcher) => {
  return items.filter((item) =>
    Object.keys(matcher).some((matcherProp) => {
      return item[matcherProp] === matcher[matcherProp];
    }),
  );
};

/**
 * This function is used to get a nested value from an object using a path,
 * e.g., with obj being { foo: { bar: { baz: 42 } } }, ["foo","bar","baz"] will return 42,
 * and ["foo","bar"] will return { baz: 42 }.
 * @param pathElements a list of strings representing the path to the value
 * @param obj
 * @returns value on the given path
 */
const getNestedValue = (pathElements, obj) => pathElements.reduce((acc, key) => acc?.[key], obj);

const dataFetcher = (componentPath, submission) => {
  const pathElements = componentPath?.split('.') || [];
  const userData = getNestedValue(pathElements, submission?.data);
  const apiResult = getNestedValue(pathElements, submission?.metadata?.dataFetcher);

  const fetchSuccess = Array.isArray(apiResult?.data);
  const fetchFailure = !!apiResult?.fetchError;
  const fetchDisabled = !!apiResult?.fetchDisabled;
  const fetchDone = fetchDisabled ? undefined : fetchSuccess || fetchFailure;
  return {
    fetchDone,
    fetchDisabled,
    ready: fetchDone || fetchDisabled,
    empty: fetchSuccess ? apiResult?.data?.length === 0 : undefined,
    success: fetchDone ? fetchSuccess : undefined,
    failure: fetchDone ? fetchFailure : undefined,
    selected: (matcher) => {
      if (fetchSuccess) {
        const allSelectedItems = getSelectedItems(apiResult.data, userData);
        if (typeof matcher === 'string') {
          switch (matcher) {
            case 'COUNT':
              return allSelectedItems.filter((item) => item.value !== 'annet').length;
            case 'OTHER':
              return allSelectedItems.some((item) => item.value === 'annet');
            default:
              return undefined;
          }
        }
        return getMatchingItems(allSelectedItems, matcher).length > 0;
      }
      return undefined;
    },
    apiResult,
  };
};

/**
 * This is a helper function for developers to easily access submission data from browser console
 */
const data = () => {
  let forms = [];
  if (Formio.forms) {
    for (const [_id, form] of Object.entries(Formio.forms)) {
      forms.push(form?.submission?.data);
    }
  }

  return forms;
};

const UtilsOverrides = {
  translateHTMLTemplate,
  evaluate,
  sanitize,
  sanitizeJavaScriptCode,
  navFormDiffToHtml,
  getDiffTag,
  isBornBeforeYear,
  isAgeBetween,
  getAge,
  dataFetcher,
  data,
};

if (typeof global === 'object' && global.FormioUtils) {
  Object.entries(UtilsOverrides).forEach(([key, value]) => {
    Utils[key] = value;
    // FormioUtils is set on global scope by Formio if global is object
    global.FormioUtils[key] = value;
  });
}

// Formio require lodash to be available on window for custom conditionals.
if (!!Utils._ && !window._) {
  window._ = Utils._;
}

export default UtilsOverrides;
