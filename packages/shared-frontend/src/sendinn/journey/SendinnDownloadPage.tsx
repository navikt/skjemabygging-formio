import { dateUtils, ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useRef, useState } from 'react';
import Alert from '../../components/alert/Alert';
import DownloadPdfButton from '../../components/download-pdf-button/DownloadPdfButton';
import PostalSubmissionInstructions from '../../components/postal-submission-instructions/PostalSubmissionInstructions';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionActions } from '../../context/state/SubmissionStateContext';
import { FormButtonRow, FormPrevButton } from '../../form-flow/layout/FormButtonRow';
import { CreateSendinnCoverPage } from '../form/createSendinnRuntimeServices';
import { useSendinnForm } from '../form/SendinnFormProvider';

interface Props {
  createCoverPage: CreateSendinnCoverPage;
  validate: () => boolean;
  onPrevious: () => void;
}

const SendinnDownloadPage = ({ createCoverPage, validate, onPrevious }: Props) => {
  const { form, language, attachmentFilter } = useSendinnForm();
  const { getLatestSubmission } = useSubmissionActions();
  const { translate } = useLanguage();
  const { logger } = useApplication();
  const [result, setResult] = useState<{ status: 'success' } | { status: 'error'; correlationId?: string }>();
  const errorRef = useRef<HTMLDivElement>(null);
  const fileName = `${form.path.replace(/[^a-zA-Z0-9_-]/g, '_')}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;

  useEffect(() => {
    if (result?.status === 'error') errorRef.current?.focus();
  }, [result]);

  return (
    <>
      <PostalSubmissionInstructions
        introduction={translate(TEXTS.statiske.prepareLetterPage.firstDescription)}
        download={{
          title: translate(TEXTS.statiske.sendinn.coverPage.download),
          content: (
            <>
              <DownloadPdfButton
                fileName={fileName}
                isValid={validate}
                pendingLabel={translate(TEXTS.statiske.sendinn.coverPage.pending)}
                onClick={() => setResult(undefined)}
                pdfContent={() => {
                  const submission = getLatestSubmission();
                  if (!submission) throw new Error('A submission is required to download the cover page.');
                  return createCoverPage({ formPath: form.path, language, attachmentFilter, submission });
                }}
                onSuccess={() => setResult({ status: 'success' })}
                onError={(error) => {
                  const correlationId = error instanceof ResponseError ? error.correlationId : undefined;
                  logger?.error?.('Cover-page download failed', { correlationId });
                  setResult({ status: 'error', correlationId });
                }}
              >
                {translate(TEXTS.statiske.sendinn.coverPage.download)}
              </DownloadPdfButton>
              {result?.status === 'success' && (
                <div role="status">
                  <Alert variant="info">
                    {translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName })}
                  </Alert>
                </div>
              )}
              {result?.status === 'error' && (
                <div ref={errorRef} tabIndex={-1} role="alert">
                  <Alert variant="error">
                    {translate(TEXTS.statiske.sendinn.coverPage.downloadError)}
                    {result.correlationId && (
                      <p>
                        {translate(TEXTS.statiske.error.errorId)}: {result.correlationId}
                      </p>
                    )}
                  </Alert>
                </div>
              )}
            </>
          ),
        }}
        print={{
          title: translate(TEXTS.statiske.sendinn.coverPage.print),
          description: translate(TEXTS.statiske.staticPdf.instructions.step2),
        }}
        attachments={{
          title: translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo),
          description: translate(TEXTS.statiske.staticPdf.instructions.step3),
          items: [],
        }}
        mailing={{
          title: translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitleWithAttachment),
          description: translate(TEXTS.statiske.staticPdf.instructions.step4),
        }}
      />
      <FormButtonRow
        previousButton={
          <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={onPrevious} />
        }
      />
    </>
  );
};

export { SendinnDownloadPage };
