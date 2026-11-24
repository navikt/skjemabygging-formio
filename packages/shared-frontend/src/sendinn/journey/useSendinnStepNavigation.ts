import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFormDefinitionForm } from '../../context/form-definition/FormDefinitionContext';
import { useValidationActions } from '../../context/validation/ValidationContext';

interface SendinnStepNavigationOptions {
  focusId?: string;
  redirect?: true;
}

const useSendinnStepNavigation = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const form = useFormDefinitionForm();
  const { hideErrorSummary } = useValidationActions();

  return useCallback(
    (panelKey: string, { focusId, redirect }: SendinnStepNavigationOptions = {}) => {
      hideErrorSummary();
      navigate(
        { pathname: `/${form.path}/${panelKey}`, search },
        { state: focusId || redirect ? { focusId, redirect } : undefined, replace: redirect === true },
      );
    },
    [form.path, hideErrorSummary, navigate, search],
  );
};

export { useSendinnStepNavigation };
