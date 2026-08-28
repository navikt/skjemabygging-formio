import { Form, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useApplication } from '../../../context/application/ApplicationContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { b64toBlob } from '../../../utils/blob';
import { RECEIPT_KEY } from '../../form-flow/constants';
import prepareSubmissionForTransport from '../../submission/prepareSubmissionForTransport';
import { useFyllut } from '../fyllut/FyllutContext';
import { useNologinToken } from '../nologin-token/NologinTokenContext';

const createSubmissionError = (cause: unknown, userMessage: string) => ({ cause, userMessage });

const useFormSubmission = (
  form: Form,
  ensureInnsendingsId: (submission: Submission) => Promise<string | undefined>,
  setReceiptPdf?: (pdf: Blob) => void,
) => {
  const { submissions, sessions } = useRuntimeServices();
  const { logger } = useApplication();
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage, translate } = useLanguage();
  const { logEvent } = useFyllut();
  const { getNologinToken, clearNologinToken, handleSessionExpired } = useNologinToken();
  const { search } = useLocation();
  const navigate = useNavigate();

  const completeSubmission = useCallback(
    (response: { pdfBase64: string; receipt: unknown }) => {
      void logEvent?.({
        name: 'skjema fullført',
        data: {
          skjemaId: form.properties.skjemanummer,
          skjemanavn: translate(form.title),
          tema: form.properties.tema,
          language: currentLanguage,
          submissionMethod,
        },
      });
      setReceiptPdf?.(b64toBlob(response.pdfBase64, 'application/pdf'));
      navigate({ pathname: `/${form.path}/${RECEIPT_KEY}`, search }, { state: { receipt: response.receipt } });
    },
    [currentLanguage, form, logEvent, navigate, search, setReceiptPdf, submissionMethod, translate],
  );

  return useCallback(
    async (submission: Submission) => {
      const transportSubmission = prepareSubmissionForTransport(submission);
      switch (submissionMethod) {
        case 'digital': {
          const innsendingsId = await ensureInnsendingsId(transportSubmission);
          if (!innsendingsId) {
            return;
          }
          const response = await submissions.submit({
            application: { type: 'draft', id: innsendingsId },
            formPath: form.path,
            submission: transportSubmission,
            language: currentLanguage,
            submissionMethod,
          });
          completeSubmission(response);
          return;
        }
        case 'digitalnologin': {
          const nologinToken = await getNologinToken();
          try {
            const response = await submissions.submit({
              application: { type: 'noLogin', token: nologinToken ?? '' },
              formPath: form.path,
              submission: transportSubmission,
              language: currentLanguage,
              submissionMethod,
            });
            clearNologinToken();
            completeSubmission(response);
          } catch (error) {
            if (sessions.isAuthenticationError(error)) {
              handleSessionExpired();
              throw error;
            }
            throw createSubmissionError(error, TEXTS.statiske.nologin.temporarilyUnavailable);
          }
          return;
        }
        default:
          logger?.info?.('paper submission finalization is not yet implemented', {
            formPath: form.path,
            submissionMethod,
          });
      }
    },
    [
      clearNologinToken,
      completeSubmission,
      currentLanguage,
      ensureInnsendingsId,
      form.path,
      getNologinToken,
      handleSessionExpired,
      logger,
      sessions,
      submissionMethod,
      submissions,
    ],
  );
};

export { useFormSubmission };
