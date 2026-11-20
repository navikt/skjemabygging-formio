import { dateUtils, ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import Alert from '../../components/alert/Alert';
import DownloadPdfButton from '../../components/download-pdf-button/DownloadPdfButton';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSendinnRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionActions } from '../../context/state/SubmissionStateContext';
import { useSendinnForm } from '../form/SendinnFormProvider';
import styles from './CoverPageDownloadSection.module.css';

interface Props {
  isValid: () => boolean;
}

type DownloadState = { status: 'success' } | { status: 'error'; correlationId?: string };

const CoverPageDownloadSection = ({ isValid }: Props) => {
  const { translate } = useLanguage();
  const { coverPage } = useSendinnRuntimeServices();
  const { logger } = useApplication();
  const { form, language, attachmentFilter } = useSendinnForm();
  const { getLatestSubmission } = useSubmissionActions();
  const [downloadState, setDownloadState] = useState<DownloadState>();
  const errorRef = useRef<HTMLDivElement>(null);
  const fileName = useMemo(() => `${form.path}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`, [form.path]);

  useEffect(() => {
    if (downloadState?.status === 'error') errorRef.current?.focus();
  }, [downloadState]);

  const getPdfContent = () => {
    const submission = getLatestSubmission();
    if (!submission) throw new Error('A submission is required to download the cover page.');
    if (form.revision === undefined) throw new Error('A form revision is required to download the cover page.');

    return coverPage.create({ formPath: form.path, revision: form.revision, language, attachmentFilter, submission });
  };

  return (
    <div className={styles.downloadSection}>
      <DownloadPdfButton
        fileName={fileName}
        isValid={isValid}
        pendingLabel={translate(TEXTS.statiske.sendinn.coverPage.pending)}
        onClick={() => setDownloadState(undefined)}
        onSuccess={() => setDownloadState({ status: 'success' })}
        onError={(error) => {
          const correlationId = error instanceof ResponseError ? error.correlationId : undefined;
          logger?.error?.('Cover-page download failed', { correlationId });
          setDownloadState({ status: 'error', correlationId });
        }}
        pdfContent={getPdfContent}
      >
        {translate(TEXTS.statiske.sendinn.coverPage.download)}
      </DownloadPdfButton>
      {downloadState?.status === 'success' && (
        <Alert variant="info">{translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName })}</Alert>
      )}
      {downloadState?.status === 'error' && (
        <div ref={errorRef} tabIndex={-1} role="alert">
          <Alert variant="error">
            {translate(TEXTS.statiske.sendinn.coverPage.downloadError)}
            {downloadState.correlationId && (
              <p>
                {translate(TEXTS.statiske.error.errorId)}: {downloadState.correlationId}
              </p>
            )}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default CoverPageDownloadSection;
