import _ from 'lodash';
import sanitizeJavaScriptCode from './sanitize-javascript-code';

const getOverrides = (Utils) => {
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
  const evaluate = (func, args, ret?, tokenize?) => {
    return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
  };

  // override to skip formio's default HTML translation
  const translateHTMLTemplate = (template, translate) => {
    return translate(template);
  };

  /* Override to ensure that utils and submission are passed to evaluate.
   * These are automagically passed by Formio when the form is rendered using templates,
   * but not when checkCondition is invoked manually, e.g., when formSummaryUtils is used in
   * fyllut-backend, or when rendering FormStepper (React).
   */
  const checkCustomConditional = (component, custom, row, data, form, variable, onError, instance, submission) => {
    if (typeof custom === 'string') {
      custom = `var ${variable} = true; ${custom}; return ${variable};`;
    }
    const evaluateArgs = { row, data, form, utils: Utils, ...(submission && { submission }), _ };
    const value =
      instance && instance.evaluate ? instance.evaluate(custom, evaluateArgs) : evaluate(custom, evaluateArgs);
    if (value === null) {
      return onError;
    }
    return value;
  };

  /*
   * Override to invoke checkCustomConditional with submission, which is needed for miscellaneous util functions
   */
  const originalCheckCondition = Utils.checkCondition;
  const checkCondition = (component, row, data, form, instance, submission) => {
    const { customConditional } = component;
    if (customConditional) {
      return checkCustomConditional(component, customConditional, row, data, form, 'show', true, instance, submission);
    }
    return originalCheckCondition(component, row, data, form, instance);
  };

  return {
    sanitize,
    evaluate,
    translateHTMLTemplate,
    checkCustomConditional,
    checkCondition,
  };
};

export default getOverrides;
