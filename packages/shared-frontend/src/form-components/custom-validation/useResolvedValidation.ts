import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { FieldValidationProp } from '../../components/types';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { resolveValidation } from '../inputComponentRegistryUtils';
import { usePageComponents } from '../PageComponentsContext';
import { resolveCustomValidationRules } from './customValidationRules';

/**
 * The rules an input adapter passes to its component: what the form author declared, plus the value
 * rules that replaced a recognized legacy `validate.custom`.
 *
 * The rules are rebuilt whenever the submission changes, so a comparison against another field
 * follows that field the moment it is answered. The headless page rebuild derives the exact same
 * rules from the same functions (`toFieldValidationInput`), which is what keeps a page the user
 * never opened - where nothing is rendered to register anything - validating identically.
 */
const useResolvedValidation = (component: Component): FieldValidationProp => {
  const { submission } = useSubmissionState();
  const pageComponents = usePageComponents();

  return useMemo(
    () => ({
      ...resolveValidation(component),
      ...resolveCustomValidationRules(component, { submission, pageComponents }),
    }),
    [component, pageComponents, submission],
  );
};

export { useResolvedValidation };
