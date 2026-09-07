import {
  Form,
  FormsApiTranslationMap,
  Submission,
  SubmissionMethod,
  submissionTypesUtils,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  applyPrefillDataToForm,
  findUnsupportedCustomValidation,
  getFormPrefillKeys,
  initializeDigitalDraft,
  resolveDefaultSubmissionMethod,
  RuntimeServices,
  UnsupportedCustomValidation,
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
  | { type: 'unsupportedByRenderer'; unsupportedCustomValidation: UnsupportedCustomValidation[] }
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
  const [unsupported, setUnsupported] = useState<{
    loadKey: string;
    customValidation: UnsupportedCustomValidation[];
  }>();
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

        // Checked before anything with a side effect (prefill, draft creation): a form the new
        // renderer cannot validate faithfully must be handed straight back to the old renderer.
        const unsupportedCustomValidation = findUnsupportedCustomValidation(bootstrap.form);
        if (unsupportedCustomValidation.length > 0) {
          // The old renderer relies on the backend sending a deep link without a submission type to
          // the intro page first, which the backend skips for an allowlisted form. Do it here, so
          // handing the form back lands the user exactly where it would have without the allowlist.
          if (
            !!routePath &&
            !new URLSearchParams(search).has('sub') &&
            submissionTypesUtils.containsMultipleStandardSubmissionTypes(bootstrap.form.properties?.submissionTypes)
          ) {
            return { type: 'redirect', pathname: `/${formPath}`, search };
          }

          return { type: 'unsupportedByRenderer', unsupportedCustomValidation };
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
          case 'unsupportedByRenderer':
            setUnsupported({ loadKey, customValidation: result.unsupportedCustomValidation });
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

  const isLoading =
    initializedForm?.loadKey !== loadKey && notFoundLoadKey !== loadKey && unsupported?.loadKey !== loadKey;

  return {
    initializedForm: initializedForm?.loadKey === loadKey ? initializedForm : undefined,
    unsupportedCustomValidation: unsupported?.loadKey === loadKey ? unsupported.customValidation : undefined,
    isLoading,
  };
};

export default useInitializeRenderForm;
export type { InitializedForm };
