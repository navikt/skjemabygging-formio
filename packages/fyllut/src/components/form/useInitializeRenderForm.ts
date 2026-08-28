import {
  Form,
  FormsApiTranslationMap,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  applyPrefillDataToForm,
  getFormPrefillKeys,
  initializeDigitalDraft,
  resolveDefaultSubmissionMethod,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect, useRef, useState } from 'react';
import { NavigateFunction } from 'react-router';
import { RenderFormBootstrapService } from '../../adapter-services/createRenderFormBootstrapService';

interface InitializedForm {
  loadKey: string;
  form: Form;
  translations: FormsApiTranslationMap;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  initialLanguage?: TranslationLang;
}

type InitializationResult =
  | { type: 'ready'; initializedForm: InitializedForm }
  | { type: 'notFound' }
  | { type: 'draftNotFound' }
  | { type: 'redirect'; pathname?: string; search: string };

interface Props {
  formPath?: string;
  routePath?: string;
  search: string;
  submissionMethod?: SubmissionMethod;
  bootstrapService: RenderFormBootstrapService;
  applications: RuntimeServices['applications'];
  navigate: NavigateFunction;
  loadKey: string;
}

const buildSearchWithSubmissionMethod = (search: string, submissionMethod: string) => {
  const searchParams = new URLSearchParams(search);
  searchParams.set('sub', submissionMethod);
  return `?${searchParams.toString()}`;
};

const useInitializeRenderForm = ({
  formPath,
  routePath,
  search,
  submissionMethod,
  bootstrapService,
  applications,
  navigate,
  loadKey,
}: Props) => {
  const [initializedForm, setInitializedForm] = useState<InitializedForm>();
  const [notFoundLoadKey, setNotFoundLoadKey] = useState<string>();
  const loadRef = useRef<{ key: string; promise: Promise<InitializationResult> }>();

  useEffect(() => {
    if (!formPath) {
      return;
    }

    if (loadRef.current?.key !== loadKey) {
      const initialize = async (): Promise<InitializationResult> => {
        const bootstrap = await bootstrapService.load(formPath);
        if (!bootstrap) {
          return { type: 'notFound' };
        }

        const defaultSubmissionMethod = resolveDefaultSubmissionMethod(bootstrap.form.properties.submissionTypes);
        if (!!routePath && !new URLSearchParams(search).has('sub') && defaultSubmissionMethod === 'paper') {
          return {
            type: 'redirect',
            search: buildSearchWithSubmissionMethod(search, defaultSubmissionMethod),
          };
        }

        const prefillKeys = submissionMethod === 'digital' ? getFormPrefillKeys(bootstrap.form) : [];
        const prefillData = prefillKeys.length > 0 ? await bootstrapService.getPrefillData(prefillKeys) : undefined;
        const form = applyPrefillDataToForm(bootstrap.form, prefillData);
        const draftInitialization =
          routePath === 'paabegynt'
            ? undefined
            : await initializeDigitalDraft({
                applications,
                form,
                search,
                submissionMethod,
              });

        if (draftInitialization?.type === 'notFound') {
          return { type: 'draftNotFound' };
        }
        if (draftInitialization?.type === 'redirect') {
          return draftInitialization;
        }

        const initializedDraft = draftInitialization?.type === 'ready' ? draftInitialization : undefined;

        return {
          type: 'ready',
          initializedForm: {
            loadKey,
            form,
            translations: bootstrap.translations,
            initialSubmission: initializedDraft?.initialSubmission,
            initialInnsendingsId: initializedDraft?.initialInnsendingsId,
            initialLanguage: initializedDraft?.initialLanguage,
          },
        };
      };

      loadRef.current = { key: loadKey, promise: initialize() };
    }

    let active = true;

    loadRef.current.promise
      .then((result) => {
        if (!active) {
          return;
        }

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
            navigate({ pathname: result.pathname, search: result.search }, { replace: true });
        }
      })
      .catch(() => {
        if (active) {
          setNotFoundLoadKey(loadKey);
        }
      });

    return () => {
      active = false;
    };
  }, [applications, bootstrapService, formPath, loadKey, navigate, routePath, search, submissionMethod]);

  const isLoading = initializedForm?.loadKey !== loadKey && notFoundLoadKey !== loadKey;

  return {
    initializedForm: initializedForm?.loadKey === loadKey ? initializedForm : undefined,
    isLoading,
  };
};

export default useInitializeRenderForm;
export type { InitializedForm };
