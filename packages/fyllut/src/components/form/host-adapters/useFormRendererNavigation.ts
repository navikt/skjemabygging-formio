import type { FormRendererNavigation } from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getFormRendererRoutePath, getNavigationState } from './formRendererRoutes';

const useFormRendererNavigation = (formPath: string): FormRendererNavigation['navigate'] => {
  const { search, state } = useLocation();
  const navigate = useNavigate();

  return useCallback(
    ({ route, submission, validationErrorPages, focusId }) => {
      navigate(
        {
          pathname: getFormRendererRoutePath(formPath, route),
          search,
          hash: focusId ? `#${focusId}` : undefined,
        },
        {
          state: {
            ...getNavigationState(state),
            initialSubmission: submission,
            preserveInitialSubmission: true,
            validationErrorPages,
            focusId,
          },
        },
      );
    },
    [formPath, navigate, search, state],
  );
};

export { useFormRendererNavigation };
