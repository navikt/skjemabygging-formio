import {
  Form,
  hasErrorCode,
  localizationUtils,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { applyInitialValuesToSubmission } from '../../context/form-definition/initialSubmissionValues';
import { ApplicationService } from '../../context/runtime-services/RuntimeServicesContext';
import { updateSearch } from '../../utils/searchParams';
import { withDraftMetadata } from './withDraftMetadata';

type ReadyDigitalDraft = {
  type: 'ready';
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  initialLanguage?: TranslationLang;
};

type DigitalDraftInitialization =
  ReadyDigitalDraft | { type: 'notFound' } | { type: 'redirect'; pathname?: string; search: string };

interface Props {
  applications: ApplicationService;
  form: Form;
  search: string;
  submissionMethod?: SubmissionMethod;
}

const getDraftBootstrapLanguage = (search: string): TranslationLang => {
  const language = new URLSearchParams(search).get('lang');
  return language ? localizationUtils.getLanguageCodeAsIso639_1(language) : 'nb';
};

const initializeDigitalDraft = async ({
  applications,
  form,
  search,
  submissionMethod,
}: Props): Promise<DigitalDraftInitialization> => {
  if (submissionMethod !== 'digital') {
    return { type: 'ready' };
  }

  const searchParams = new URLSearchParams(search);
  const innsendingsId = searchParams.get('innsendingsId') ?? undefined;

  if (innsendingsId) {
    try {
      const draft = await applications.getDraft(innsendingsId);

      return {
        type: 'ready',
        initialInnsendingsId: innsendingsId,
        initialLanguage: draft.language,
        initialSubmission: withDraftMetadata(draft.submission, draft),
      };
    } catch (error) {
      if (hasErrorCode(error, 'NOT_FOUND')) {
        return { type: 'notFound' };
      }
      throw error;
    }
  }

  const language = getDraftBootstrapLanguage(search);
  const submission = applyInitialValuesToSubmission(form, undefined, language, { submissionMethod }) ?? { data: {} };
  const result = await applications.createDraft({
    formPath: form.path,
    submission,
    language,
    submissionMethod,
    force: searchParams.get('forceMellomlagring') === 'true',
  });

  if (result.status === 'alreadyExists') {
    return {
      type: 'redirect',
      pathname: `/${form.path}/paabegynt`,
      search: updateSearch(search, { sub: 'digital', forceMellomlagring: undefined }),
    };
  }

  return {
    type: 'redirect',
    search: updateSearch(search, {
      sub: 'digital',
      forceMellomlagring: undefined,
      innsendingsId: result.draft.id,
    }),
  };
};

export { initializeDigitalDraft };
export type { DigitalDraftInitialization };
