import type { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

const useSubmissionMethodSelection = (formPath: string, isLoggedIn: boolean) => {
  const { search } = useLocation();
  const navigate = useNavigate();

  return useCallback(
    (submissionMethod: SubmissionMethod) => {
      const queryParameters = new URLSearchParams(search);
      queryParameters.set('sub', submissionMethod);

      if (submissionMethod === 'digital') {
        queryParameters.set('forceMellomlagring', 'true');
      } else {
        queryParameters.delete('forceMellomlagring');
      }

      const nextSearch = `?${queryParameters.toString()}`;
      if (submissionMethod === 'digital' && !isLoggedIn) {
        window.location.assign(`${window.location.origin}/fyllut/${formPath}${nextSearch}`);
        return;
      }
      if (submissionMethod === 'digitalnologin') {
        navigate({ pathname: `/${formPath}/legitimasjon`, search: nextSearch });
        return;
      }
      navigate({ pathname: `/${formPath}`, search: nextSearch });
    },
    [formPath, isLoggedIn, navigate, search],
  );
};

export default useSubmissionMethodSelection;
