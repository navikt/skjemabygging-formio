import { Language, localizationUtils, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { ApplicationService, CreateDraftResult, Draft, FyllutHttp } from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  http: FyllutHttp;
  backendBaseUrl: string;
}

interface DraftResponse {
  innsendingsId: string;
  hoveddokumentVariant: {
    document: { data: Submission; language: Language };
  };
  endretDato: string;
  skalSlettesDato: string;
}

interface StatusResponse {
  status: string;
}

const draftAlreadyExists = (response: DraftResponse | StatusResponse): response is StatusResponse =>
  'status' in response && response.status === 'soknadAlreadyExists';

const mapDraft = (response: DraftResponse): Draft => ({
  id: response.innsendingsId,
  language: localizationUtils.getLanguageCodeAsIso639_1(response.hoveddokumentVariant.document.language),
  submission: response.hoveddokumentVariant.document.data,
  modifiedAt: response.endretDato,
  deleteAt: response.skalSlettesDato,
});

const createApplicationService = ({ http, backendBaseUrl }: Props): ApplicationService => {
  const draftsUrl = `${backendBaseUrl}/api/send-inn/soknad`;

  return {
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
        : ({ status: 'created', draft: mapDraft(response) } satisfies CreateDraftResult);
    },
    updateDraft: async ({ id, formPath, submission, language, submissionMethod }) => {
      const response = await http.put<DraftResponse>(draftsUrl, {
        innsendingsId: id,
        formPath,
        submission,
        language,
        submissionMethod,
      });
      return mapDraft(response);
    },
    deleteDraft: async (id) => {
      await http.delete(`${draftsUrl}/${id}`);
    },
  };
};

export default createApplicationService;
