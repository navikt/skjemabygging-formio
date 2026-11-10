import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFormDefinitionForm } from '../../context/form-definition/FormDefinitionContext';
import { useValidationActions } from '../../context/validation/ValidationContext';

const useSendinnStepNavigation = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const form = useFormDefinitionForm();
  const { hideErrorSummary } = useValidationActions();

  return useCallback(
    (panelKey: string, focusId?: string) => {
      hideErrorSummary();
      navigate({ pathname: `/${form.path}/${panelKey}`, search }, { state: focusId ? { focusId } : undefined });
    },
    [form.path, hideErrorSummary, navigate, search],
  );
};

export { useSendinnStepNavigation };
