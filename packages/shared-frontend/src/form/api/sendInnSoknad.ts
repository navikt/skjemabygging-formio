import { Language, localizationUtils, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { FyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';

interface SendInnSoknadResponse {
  innsendingsId: string;
  hoveddokumentVariant: {
    document: { data: Submission; language: Language };
  };
  endretDato: string;
  skalSlettesDato: string;
}

interface InnsendingApiStatusResponse {
  status: string;
  info: string;
}

const soknadAlreadyExists = (response: unknown): response is InnsendingApiStatusResponse =>
  typeof response === 'object' &&
  response !== null &&
  'status' in response &&
  response.status === 'soknadAlreadyExists';

const getSoknad = async (innsendingsId: string, appConfig: FyllutAppConfig) =>
  appConfig.http?.get<SendInnSoknadResponse>(`${appConfig.baseUrl}/api/send-inn/soknad/${innsendingsId}`);

const createSoknad = async (
  appConfig: FyllutAppConfig,
  form: NavFormType,
  submission: Submission,
  language: string,
  forceMellomlagring?: boolean,
) => {
  const url = `${appConfig.baseUrl}/api/send-inn/soknad${forceMellomlagring ? '?forceMellomlagring=true' : ''}`;
  return appConfig.http?.post<SendInnSoknadResponse>(url, {
    formPath: form.path,
    submission,
    language: localizationUtils.getLanguageCodeAsIso639_1(language),
    submissionMethod: appConfig.submissionMethod,
  });
};

const updateSoknad = async (
  appConfig: FyllutAppConfig,
  form: NavFormType,
  submission: Submission,
  language: string,
  innsendingsId?: string,
) => {
  if (!innsendingsId) {
    appConfig.logger?.info?.('Unable to save draft because innsendingsId is missing');
    return undefined;
  }

  return appConfig.http?.put<SendInnSoknadResponse>(`${appConfig.baseUrl}/api/send-inn/soknad`, {
    innsendingsId,
    formPath: form.path,
    submission,
    language: localizationUtils.getLanguageCodeAsIso639_1(language),
    submissionMethod: appConfig.submissionMethod,
  });
};

const deleteSoknad = async (appConfig: FyllutAppConfig, innsendingsId: string) => {
  if (!innsendingsId) {
    appConfig.logger?.info?.('Unable to delete draft because innsendingsId is missing');
    return undefined;
  }

  return appConfig.http?.delete<{ status: string; info: string }>(
    `${appConfig.baseUrl}/api/send-inn/soknad/${innsendingsId}`,
  );
};

export { createSoknad, deleteSoknad, getSoknad, soknadAlreadyExists, updateSoknad };
export type { InnsendingApiStatusResponse, SendInnSoknadResponse };
