import { Alert } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import React, { useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import renderPdfForm from '../../form-components/RenderPdfForm';
import DownloadPdfButton from './DownloadPdfButton';

interface Props {
  type?: 'application' | 'coverPageAndApplication';
  enhetNummer?: string;
  isValid?: () => boolean;
  children: React.ReactNode;
}

type DownloadState = 'success' | 'error';

const DownloadCoverPageAndApplicationButton = ({
  type = 'coverPageAndApplication',
  enhetNummer,
  isValid,
  children,
}: Props) => {
  const { fyllutBaseURL, config, submissionMethod } = useAppConfig();
  const formContextValue = useForm();
  const { form, submission } = formContextValue;
  const languagesContextValue = useLanguages();
  const { currentLanguage, translationsForNavForm, translate } = languagesContextValue;
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

  const fileName = `${form.path}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;

  const actionUrl = `${fyllutBaseURL}/api/documents${type === 'application' ? '/application' : '/cover-page-and-application'}`;

  return (
    <>
      <DownloadPdfButton
        fileName={fileName}
        className="mb-4"
        values={{
          language: currentLanguage,
          form: JSON.stringify(form),
          submission: JSON.stringify(submission),
          translations: JSON.stringify(
            currentLanguage !== 'nb-NO' && translationsForNavForm?.[currentLanguage]
              ? translationsForNavForm[currentLanguage]
              : {},
          ),
          enhetNummer,
          submissionMethod,
          pdfFormData: renderPdfForm({
            formContextValue,
            languagesContextValue,
            isDelingslenke: !!config?.isDelingslenke,
            gitVersion: String(config?.gitVersion),
            submissionMethod,
          }),
        }}
        actionUrl={actionUrl}
        isValid={isValid}
        onSuccess={onSuccess}
        onError={onError}
        onClick={onClick}
      >
        {children}
      </DownloadPdfButton>

      {downloadState === 'success' && (
        <Alert variant="info" className="mb-4">
          {translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName })}
        </Alert>
      )}

      {downloadState === 'error' && (
        <Alert variant="error" className="mb-4">
          {translate(TEXTS.statiske.prepareLetterPage.downloadError)}
        </Alert>
      )}
    </>
  );
};

export default DownloadCoverPageAndApplicationButton;
