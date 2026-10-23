import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { FieldValidationProp } from '../../components/types';
import { useFormDefinitionForm } from '../../context/form-definition/FormDefinitionContext';
import { useFieldStateValue } from '../../context/state/StateContext';
import { useSubmissionActions } from '../../context/state/SubmissionStateContext';
import { resolveValidation } from '../inputComponentUtils';
import { getCustomValidationDependencyPath, resolveCustomValidationRules } from './customValidationRules';

/**
 * The rules an input adapter passes to its component: what the form author declared, plus the value
 * rules that replaced a recognized legacy `validate.custom`.
 *
 * The rules are rebuilt whenever the value they compare against changes, so a comparison against
 * another field follows that field the moment it is answered. Only that value is followed, so typing
 * elsewhere in the form does not rerender every input. The headless page rebuild derives the exact
 * same rules from the same functions (`toFieldValidationInput`), which is what keeps a page the user
 * never opened - where nothing is rendered to register anything - validating identically.
 */
const useResolvedValidation = (component: Component): FieldValidationProp => {
  const { getLatestSubmission } = useSubmissionActions();
  const { components: formComponents } = useFormDefinitionForm();
  const dependencyPath = useMemo(
    () => getCustomValidationDependencyPath(component, formComponents),
    [component, formComponents],
  );
  const dependencyValue = useFieldStateValue(dependencyPath ?? '', dependencyPath !== undefined);

  return useMemo(
    () => ({
      ...resolveValidation(component),
      ...resolveCustomValidationRules(component, { submission: getLatestSubmission(), formComponents }),
    }),
    // `dependencyValue` is the one value the custom rules read. It is not used directly, but tells
    // React when to rebuild the rules from the latest submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [component, dependencyValue, formComponents, getLatestSubmission],
  );
};

export { useResolvedValidation };
