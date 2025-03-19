import { Alert } from '@navikt/ds-react';
import { dateUtils, NavFormType, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import React, { useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import DownloadPdfButton from './DownloadPdfButton';
import { sanitizeFileName } from './downloadUtil';

interface Props {
  form: NavFormType;
  submission: Submission;
  translations: any;
  enhetNummer?: string;
  isValid?: () => boolean;
  submissionMethod?: string;
  children: React.ReactNode;
}

type DownloadState = 'success' | 'error';

const DownloadCoverPageAndApplicationButton = ({
  form,
  submission,
  translations,
  enhetNummer,
  isValid,
  submissionMethod,
  children,
}: Props) => {
  const { translate } = useLanguages();
  const { fyllutBaseURL } = useAppConfig();
  const { currentLanguage } = useLanguages();
  const [downloadState, setDownloadState] = useState<DownloadState>();

  const onClick = () => {
    setDownloadState(undefined);
  };

  const onSuccess = () => {
    setDownloadState('success');
  };

  const onError = () => {
    setDownloadState('error');
  };

  const fileName = `${sanitizeFileName(form.title)}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;

  return (
    <>
      <DownloadPdfButton
        fileName={fileName}
        className="mb-4"
        values={{
          language: currentLanguage,
          form: JSON.stringify(form),
          submission: JSON.stringify(submission),
          translations: JSON.stringify(currentLanguage !== 'nb-NO' ? translations[currentLanguage] : {}),
          enhetNummer,
          submissionMethod: submissionMethod ?? 'paper',
        }}
        actionUrl={`${fyllutBaseURL}/api/documents/front-page-and-application`}
        isValid={isValid}
        onSuccess={onSuccess}
        onError={onError}
        onClick={onClick}
      >
        {children}
      </DownloadPdfButton>

      {downloadState === 'success' && (
        <Alert variant="info">{translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName })}</Alert>
      )}

      {downloadState === 'error' && (
        <Alert variant="error">{translate(TEXTS.statiske.prepareLetterPage.downloadError)}</Alert>
      )}
    </>
  );
};

export default DownloadCoverPageAndApplicationButton;
