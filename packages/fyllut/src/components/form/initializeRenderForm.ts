import {
  FormsApiTranslationMap,
  FormWithLanguages,
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
import type { RenderFormBootstrapService } from '../../adapter-services/createRenderFormBootstrapService';

interface InitializedForm {
  loadKey: string;
  form: FormWithLanguages;
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

interface InitializeRenderFormProps {
  formPath: string;
  routePath?: string;
  search: string;
  submissionMethod?: SubmissionMethod;
  bootstrapService: RenderFormBootstrapService;
  applications: RuntimeServices['applications'];
  loadKey: string;
}

const buildSearchWithSubmissionMethod = (search: string, submissionMethod: string) => {
  const searchParams = new URLSearchParams(search);
  searchParams.set('sub', submissionMethod);
  return `?${searchParams.toString()}`;
};

const initializeRenderForm = async ({
  formPath,
  routePath,
  search,
  submissionMethod,
  bootstrapService,
  applications,
  loadKey,
}: InitializeRenderFormProps): Promise<InitializationResult> => {
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

export { initializeRenderForm };
export type { InitializationResult, InitializedForm };
