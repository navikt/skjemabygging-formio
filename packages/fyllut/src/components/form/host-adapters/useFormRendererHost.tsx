import { url, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import {
  attachmentUtils,
  Form,
  formioFormsApiUtils,
  localizationUtils,
  Submission,
  SubmissionMethod,
} from '@navikt/skjemadigitalisering-shared-domain';
import type {
  FormRendererAttachmentAdapter,
  FormRendererHostAdapter,
  FormRendererNavigation,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import FormLanguageSelector from '../FormLanguageSelector';
import useFormCancellation from './useFormCancellation';
import useSubmissionMethodSelection from './useSubmissionMethodSelection';

const PDF_DOCUMENT_PATH = {
  application: '/application',
  'cover-page-and-application': '/cover-page-and-application',
} as const;

interface NoLoginTokenAdapter {
  clearToken: () => void;
  getToken: () => Promise<string | undefined>;
  tokenExpiration?: number;
}

interface UseFormRendererHostParameters {
  attachmentAdapter: FormRendererAttachmentAdapter;
  currentDraftId?: string;
  form: Form;
  isDeletedDraftSummary: boolean;
  onNavigate: FormRendererNavigation['navigate'];
  noLoginToken: NoLoginTokenAdapter;
  submissionMethod: SubmissionMethod | undefined;
}

const useFormRendererHost = ({
  attachmentAdapter,
  currentDraftId,
  form,
  isDeletedDraftSummary,
  onNavigate,
  noLoginToken,
  submissionMethod,
}: UseFormRendererHostParameters): FormRendererHostAdapter => {
  const appConfig = useAppConfig();
  const { currentLanguage, translate } = useLanguages();
  const { search } = useLocation();
  const navigate = useNavigate();
  const cancel = useFormCancellation({ attachmentAdapter, currentDraftId, submissionMethod });
  const isLoggedIn = appConfig.config?.isLoggedIn === true;
  const selectSubmissionMethod = useSubmissionMethodSelection(form.path, isLoggedIn);

  return useMemo(
    () => ({
      navigation: { navigate: onNavigate },
      attachments: attachmentAdapter,
      noLogin: {
        getToken: noLoginToken.getToken,
        clearToken: noLoginToken.clearToken,
        tokenExpiration: noLoginToken.tokenExpiration,
      },
      secondaryActions: {
        exitUrl: url.getExitUrl(window.location.href),
        cancel,
        showIdentificationAction: submissionMethod === 'digitalnologin',
        onIdentification: () => navigate({ pathname: `/${form.path}/legitimasjon`, search }),
      },
      pdf: {
        createPdf: async ({ submission, language, submissionMethod: requestedSubmissionMethod, type }) =>
          await appConfig.http?.post<Blob>(
            `${appConfig.fyllutBaseURL}/api/documents${PDF_DOCUMENT_PATH[type]}`,
            {
              language: localizationUtils.getLanguageCodeAsIso639_1(language),
              formPath: form.path,
              submission: JSON.stringify(submission),
              submissionMethod: requestedSubmissionMethod,
            },
            { Accept: appConfig.http?.MimeType.PDF },
          ),
        onDownloaded: ({ type }) =>
          appConfig.logEvent?.({
            name: 'last ned',
            data: {
              type: 'soknad',
              tema: form.properties.tema,
              tittel: translate(form.title),
              skjemaId: form.properties.skjemanummer,
              withCoverPage: type === 'cover-page-and-application',
              submissionMethod,
              language: currentLanguage,
            },
          }),
        getCoverPageAttachments: (formDefinition: Form, submission: Submission) =>
          attachmentUtils.getAttachmentsForCoverPage(submission, formioFormsApiUtils.mapFormToNavForm(formDefinition)),
        getAttachmentFormUrl: (attachmentFormPath: string) =>
          `${appConfig.fyllutBaseURL}/${attachmentFormPath}?sub=papernocoverpage`,
      },
      receipt: {
        myPageUrl: url.getMyPageUrl(window.location.href),
        onPdfDownloaded: () =>
          appConfig.logEvent?.({
            name: 'last ned',
            data: {
              type: 'soknad',
              tema: form.properties.tema,
              tittel: translate(form.title),
              skjemaId: form.skjemanummer,
              submissionMethod,
              language: currentLanguage,
            },
          }),
      },
      languageSelector: <FormLanguageSelector />,
      isLoggedIn,
      isDeletedDraftSummary,
      onSelectSubmissionMethod: selectSubmissionMethod,
    }),
    [
      appConfig,
      attachmentAdapter,
      cancel,
      currentLanguage,
      form,
      isDeletedDraftSummary,
      isLoggedIn,
      navigate,
      noLoginToken.clearToken,
      noLoginToken.getToken,
      noLoginToken.tokenExpiration,
      onNavigate,
      search,
      selectSubmissionMethod,
      submissionMethod,
      translate,
    ],
  );
};

export { useFormRendererHost };
