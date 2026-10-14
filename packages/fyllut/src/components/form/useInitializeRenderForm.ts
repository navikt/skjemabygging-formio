import { getResponseErrorData, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ApplicationLogger, RuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useRef, useState } from 'react';
import { NavigateFunction } from 'react-router';
import { RenderFormBootstrapService } from '../../adapter-services/createRenderFormBootstrapService';
import { InitializationResult, InitializedForm, initializeRenderForm } from './initializeRenderForm';

interface Props {
  formPath?: string;
  routePath?: string;
  search: string;
  submissionMethod?: SubmissionMethod;
  bootstrapService: RenderFormBootstrapService;
  applications: RuntimeServices['applications'];
  navigate: NavigateFunction;
  loadKey: string;
  logger?: ApplicationLogger;
}

const useInitializeRenderForm = ({
  formPath,
  routePath,
  search,
  submissionMethod,
  bootstrapService,
  applications,
  navigate,
  loadKey,
  logger,
}: Props) => {
  const [initializedForm, setInitializedForm] = useState<InitializedForm>();
  const [notFoundLoadKey, setNotFoundLoadKey] = useState<string>();
  const [failedLoadKey, setFailedLoadKey] = useState<string>();
  const loadRef = useRef<{ key: string; promise: Promise<InitializationResult> }>();

  useEffect(() => {
    if (!formPath) {
      return;
    }

    if (loadRef.current?.key !== loadKey) {
      loadRef.current = {
        key: loadKey,
        promise: initializeRenderForm({
          formPath,
          routePath,
          search,
          submissionMethod,
          bootstrapService,
          applications,
          loadKey,
        }),
      };
    }

    let active = true;

    loadRef.current.promise
      .then((result) => {
        if (!active) {
          return;
        }

        setFailedLoadKey(undefined);
        switch (result.type) {
          case 'ready':
            setInitializedForm(result.initializedForm);
            return;
          case 'notFound':
            setNotFoundLoadKey(loadKey);
            return;
          case 'draftNotFound':
            navigate('/soknad-ikke-funnet', { replace: true });
            return;
          case 'redirect':
            // Resolve the destination instead of reusing the redirect for the same load key.
            loadRef.current = undefined;
            navigate({ pathname: result.pathname, search: result.search }, { replace: true });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setFailedLoadKey(loadKey);
          logger?.error?.('Failed to initialize new form renderer', {
            formPath,
            errorCode: getResponseErrorData(error)?.errorCode,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [applications, bootstrapService, formPath, loadKey, logger, navigate, routePath, search, submissionMethod]);

  const hasInitializationError = failedLoadKey === loadKey;
  const isLoading = initializedForm?.loadKey !== loadKey && notFoundLoadKey !== loadKey && !hasInitializationError;

  return {
    initializedForm: initializedForm?.loadKey === loadKey ? initializedForm : undefined,
    isLoading,
    hasInitializationError,
  };
};

export default useInitializeRenderForm;
export type { InitializedForm };
