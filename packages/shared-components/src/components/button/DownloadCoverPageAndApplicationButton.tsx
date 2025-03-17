import { Alert } from '@navikt/ds-react';
import { dateUtils, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import React, { useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import DownloadPdfButton from './DownloadPdfButton';

interface Props {
  form: NavFormType;
  submission: Submission;
  translations: any;
  enhetNummer?: string;
  isValid?: () => boolean;
  submissionMethod?: string;
  children: React.ReactNode;
}

type DownloadState = 'succes' | 'error';

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
    setDownloadState('succes');
  };

  const onError = () => {
    setDownloadState('error');
  };

  const fileName = `${form.title.toLowerCase().replace(/\s+/g, '-')}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;

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

      {downloadState === 'succes' && (
        <Alert variant="info">
          {translate(
            `Søknaden din er lastet ned med navnet ${fileName} og ligger i mappen for nedlastninger på enheten din.`,
          )}
        </Alert>
      )}

      {downloadState === 'error' && (
        <Alert variant="error">
          {translate('Det skjedde en feil ved nedlasting av søknaden. Vennligst prøv igjen senere.')}
        </Alert>
      )}
    </>
  );
};

export default DownloadCoverPageAndApplicationButton;
