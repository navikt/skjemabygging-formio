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
import { useEffect, useState } from 'react';
import { NavigateFunction } from 'react-router';
import { RenderFormBootstrapService } from '../../adapter-services/createRenderFormBootstrapService';

interface InitializedForm {
  form: Form;
  translations: FormsApiTranslationMap;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  initialLanguage?: TranslationLang;
}

interface Props {
  formPath?: string;
  routePath?: string;
  search: string;
  submissionMethod?: SubmissionMethod;
  bootstrapService: RenderFormBootstrapService;
  applications: RuntimeServices['applications'];
  navigate: NavigateFunction;
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
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initializedForm, setInitializedForm] = useState<InitializedForm>();

  useEffect(() => {
    if (!formPath) {
      return;
    }

    let active = true;

    const initialize = async (): Promise<boolean> => {
      const bootstrap = await bootstrapService.load(formPath);
      if (!active || !bootstrap) {
        return false;
      }

      const defaultSubmissionMethod = resolveDefaultSubmissionMethod(bootstrap.form.properties.submissionTypes);
      if (!!routePath && !new URLSearchParams(search).has('sub') && defaultSubmissionMethod === 'paper') {
        navigate({ search: buildSearchWithSubmissionMethod(search, defaultSubmissionMethod) }, { replace: true });
        return true;
      }

      const prefillKeys = submissionMethod === 'digital' ? getFormPrefillKeys(bootstrap.form) : [];
      const prefillData = prefillKeys.length > 0 ? await bootstrapService.getPrefillData(prefillKeys) : undefined;
      if (!active) {
        return false;
      }

      const form = applyPrefillDataToForm(bootstrap.form, prefillData);
      const draft = await initializeDigitalDraft({
        applications,
        form,
        search,
        submissionMethod,
      });
      if (!active) {
        return false;
      }

      if (draft.type === 'notFound') {
        navigate('/soknad-ikke-funnet', { replace: true });
        return true;
      }
      if (draft.type === 'redirect') {
        navigate({ pathname: draft.pathname, search: draft.search }, { replace: true });
        return true;
      }

      setInitializedForm({
        form,
        translations: bootstrap.translations,
        initialSubmission: draft.initialSubmission,
        initialInnsendingsId: draft.initialInnsendingsId,
        initialLanguage: draft.initialLanguage,
      });

      return false;
    };

    initialize()
      .then((didNavigate) => {
        if (active && !didNavigate) {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setInitializedForm(undefined);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applications, bootstrapService, formPath, navigate, routePath, search, submissionMethod]);

  return { initializedForm, isLoading };
};

export default useInitializeRenderForm;
export type { InitializedForm };
