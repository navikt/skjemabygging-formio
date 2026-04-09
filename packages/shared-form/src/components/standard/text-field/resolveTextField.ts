import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ResolveContext, ResolvedTextFieldModel } from '../../../types';
import { formComponentUtils } from '../../../utils';

const resolveTextField = (component: Component, context: ResolveContext): ResolvedTextFieldModel | null => {
  const submissionPath = formComponentUtils.getComponentSubmissionPath(component, context.submissionPath);
  const value = formComponentUtils.getSubmissionValue(submissionPath, context.submission);

  if (value === undefined || typeof value === 'object') {
    return null;
  }

  return {
    id: component.id,
    navId: component.navId,
    key: component.key,
    label: component.label,
    type: 'textField',
    autocomplete: component.autocomplete,
    description: component.description,
    disabled: component.disabled,
    hideLabel: component.hideLabel,
    inputType: component.inputType,
    readOnly: component.readOnly,
    spellCheck: component.spellCheck,
    submissionPath,
    translatedLabel: component.label ? context.translate(component.label) : undefined,
    validate: component.validate,
    value,
  };
};

export { resolveTextField };
