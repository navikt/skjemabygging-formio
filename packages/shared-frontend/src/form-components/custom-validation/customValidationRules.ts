import { Component, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationRules } from '../../validation/validators';
import { recognizeCustomValidation } from './customValidationScripts';

/**
 * What a recognized legacy expression needs in order to become plain value rules: the current
 * submission, for the value it compares against. Both the rendered input adapter and the headless
 * page rebuild have it, which is what lets them produce identical rules.
 */
interface CustomValidationContext {
  submission?: Submission;
}

/**
 * The value rules that replace a component's `validate.custom`, with every referenced value already
 * resolved. Returns nothing for the scripts that are dropped (redundant or never validated), and
 * for anything unrecognized - such a form does not reach the new renderer at all.
 */
const resolveCustomValidationRules = (component: Component, context: CustomValidationContext): ValidationRules => {
  const recognized = recognizeCustomValidation(component);
  if (recognized.kind !== 'rules') {
    return {};
  }

  const { rule } = recognized;
  return {
    notEqual: {
      value: submissionUtils.getSubmissionValue(rule.referencePath, context.submission),
      message: rule.message,
      comparison: rule.comparison,
    },
  };
};

/**
 * The only submission path `resolveCustomValidationRules` reads for this component, so a rendered
 * input can follow that single value instead of the whole submission. Keep the two in sync.
 */
const getCustomValidationDependencyPath = (component: Component): string | undefined => {
  const recognized = recognizeCustomValidation(component);
  return recognized.kind === 'rules' ? recognized.rule.referencePath : undefined;
};

export { getCustomValidationDependencyPath, resolveCustomValidationRules };
export type { CustomValidationContext };
