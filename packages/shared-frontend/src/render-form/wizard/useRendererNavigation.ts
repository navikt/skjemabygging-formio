import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidation } from '../../context/validation/ValidationContext';
import type { FormRendererRoute, SharedFormRendererProps } from '../types';

const useRendererNavigation = (host: SharedFormRendererProps['host']) => {
  const { submission } = useSubmissionState();
  const { pagesWithErrors, hideSummary } = useValidation();

  return (route: FormRendererRoute, options?: { focusId?: string; validationErrorPages?: string[] }) => {
    hideSummary();
    host.navigation.navigate({
      route,
      submission,
      focusId: options?.focusId,
      validationErrorPages: options?.validationErrorPages ?? Array.from(pagesWithErrors),
    });
  };
};

export default useRendererNavigation;
