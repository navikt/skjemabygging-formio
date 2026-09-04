import { Language, localizationUtils, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ActiveTask,
  ApplicationService,
  CreateDraftResult,
  Draft,
  FyllutHttp,
} from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  http: FyllutHttp;
  backendBaseUrl: string;
}

interface DraftResponse {
  innsendingsId: string;
  hoveddokumentVariant: {
    document: { data: Submission; language: Language } | string;
  };
  endretDato: string;
  skalSlettesDato: string;
}

interface StatusResponse {
  status: string;
}

interface ActiveTaskResponse {
  innsendingsId: string;
  endretDato: string;
  soknadstype: 'soknad' | 'ettersendelse';
}

const draftAlreadyExists = (response: DraftResponse | StatusResponse): response is StatusResponse =>
  'status' in response && response.status === 'soknadAlreadyExists';

const mapActiveTask = ({ innsendingsId, endretDato, soknadstype }: ActiveTaskResponse): ActiveTask => ({
  id: innsendingsId,
  modifiedAt: endretDato,
  type: soknadstype === 'soknad' ? 'draft' : 'attachment',
});

const mapDraft = (response: DraftResponse, fallback?: Pick<Draft, 'language' | 'submission'>): Draft => {
  const document = response.hoveddokumentVariant.document;
  const decodedDocument = typeof document === 'object' ? document : undefined;

  if (!decodedDocument && !fallback) {
    throw new Error('Draft response document must be decoded.');
  }

  const language = decodedDocument
    ? localizationUtils.getLanguageCodeAsIso639_1(decodedDocument.language)
    : fallback?.language;
  const submission = decodedDocument?.data ?? fallback?.submission;

  if (!language || !submission) {
    throw new Error('Draft response is missing language or submission data.');
  }

  return {
    id: response.innsendingsId,
    language,
    submission,
    modifiedAt: response.endretDato,
    deleteAt: response.skalSlettesDato,
  };
};

const createApplicationService = ({ http, backendBaseUrl }: Props): ApplicationService => {
  const draftsUrl = `${backendBaseUrl}/api/send-inn/soknad`;

  return {
    getActiveTasks: async (formNumber) =>
      (
        await http.get<ActiveTaskResponse[]>(`${backendBaseUrl}/api/send-inn/aktive-opprettede-soknader/${formNumber}`)
      ).map(mapActiveTask),
    getDraft: async (id) => mapDraft(await http.get<DraftResponse>(`${draftsUrl}/${id}`)),
    createDraft: async ({ formPath, submission, language, submissionMethod, force }) => {
      const response = await http.post<DraftResponse | StatusResponse>(
        `${draftsUrl}${force ? '?forceMellomlagring=true' : ''}`,
        {
          formPath,
          submission,
          language,
          submissionMethod,
        },
      );

      return draftAlreadyExists(response)
        ? { status: 'alreadyExists' }
        : ({ status: 'created', draft: mapDraft(response, { language, submission }) } satisfies CreateDraftResult);
    },
    updateDraft: async ({ id, formPath, submission, language, submissionMethod }) => {
      const response = await http.put<DraftResponse>(draftsUrl, {
        innsendingsId: id,
        formPath,
        submission,
        language,
        submissionMethod,
      });
      return mapDraft(response, { language, submission });
    },
    deleteDraft: async (id) => {
      await http.delete(`${draftsUrl}/${id}`);
    },
  };
};

export default createApplicationService;
