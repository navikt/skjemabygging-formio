import {
  dateUtils,
  Form,
  formSummaryUtils,
  hasErrorCode,
  localizationUtils,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { applyPrefilledValuesToSubmission } from '../../context/form-definition/prefillSubmission';
import { ApplicationService, Draft } from '../../context/runtime-services/RuntimeServicesContext';
import { buildDigitalFormSearch } from './digitalDraftUtils';

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

const withDraftMetadata = (submission: Submission | undefined, draft: Draft): Submission | undefined => {
  if (!submission) {
    return submission;
  }

  return {
    ...submission,
    fyllutState: {
      ...submission.fyllutState,
      mellomlagring: {
        ...submission.fyllutState?.mellomlagring,
        isActive: true,
        savedDate: dateUtils.toLocaleDateAndTime(draft.modifiedAt),
        deletionDate: dateUtils.toLocaleDate(draft.deleteAt),
      },
    },
  };
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
    let draft;
    try {
      draft = await applications.getDraft(innsendingsId);
    } catch (error) {
      if (hasErrorCode(error, 'NOT_FOUND')) {
        return { type: 'notFound' };
      }
      throw error;
    }

    return {
      type: 'ready',
      initialInnsendingsId: innsendingsId,
      initialLanguage: draft.language,
      initialSubmission: withDraftMetadata(
        formSummaryUtils.filterSubmissionDataToSummary(form, draft.submission),
        draft,
      ),
    };
  }

  const language = getDraftBootstrapLanguage(search);
  const submission = applyPrefilledValuesToSubmission(form, undefined, language) ?? { data: {} };
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
      search: buildDigitalFormSearch(search, { forceMellomlagring: undefined }),
    };
  }

  return {
    type: 'redirect',
    search: buildDigitalFormSearch(search, {
      forceMellomlagring: undefined,
      innsendingsId: result.draft.id,
    }),
  };
};

export { initializeDigitalDraft };
export type { DigitalDraftInitialization };
