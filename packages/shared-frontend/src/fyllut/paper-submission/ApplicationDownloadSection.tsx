import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import Alert from '../../components/alert/Alert';
import NavUnitSelect from '../../components/nav-unit-select/NavUnitSelect';
import { useNavUnits } from '../../components/nav-unit-select/useNavUnits';
import { useApplication } from '../../context/application/ApplicationContext';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useIntegration } from '../context/integration/IntegrationContext';
import styles from './ApplicationDownloadSection.module.css';
import DownloadPdfButton from './DownloadPdfButton';

interface Props {
  documentType: 'application' | 'application-with-cover-page';
}

const ApplicationDownloadSection = ({ documentType }: Props) => {
  const { translate, currentLanguage } = useLanguage();
  const { submissions } = useRuntimeServices();
  const { logEvent } = useIntegration();
  const { logger } = useApplication();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const form = useFormDefinitionForm();
  const { submission } = useSubmissionState();
  const [downloadState, setDownloadState] = useState<'success' | 'error'>();
  const [selectedNavUnit, setSelectedNavUnit] = useState('');
  const [navUnitSelectionError, setNavUnitSelectionError] = useState(false);
  const requiresNavUnit =
    documentType === 'application-with-cover-page' && form.properties.enhetMaVelgesVedPapirInnsending === true;
  const {
    allUnits,
    units: filteredNavUnits,
    error: navUnitFetchError,
    loading: navUnitsLoading,
  } = useNavUnits({
    enabled: requiresNavUnit,
    unitTypes: form.properties.enhetstyper,
  });
  const navUnits = filteredNavUnits?.length ? filteredNavUnits : allUnits;
  const fileName = useMemo(() => `${form.path}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`, [form.path]);

  useEffect(() => {
    if (requiresNavUnit && !navUnitsLoading && !navUnitFetchError && filteredNavUnits?.length === 0) {
      logger?.error?.('No relevant NAV units found', {
        skjemanummer: form.properties.skjemanummer,
        enhetstyper: form.properties.enhetstyper,
      });
    }
  }, [
    filteredNavUnits,
    form.properties.enhetstyper,
    form.properties.skjemanummer,
    logger,
    navUnitFetchError,
    navUnitsLoading,
    requiresNavUnit,
  ]);

  const getPdfContent = async () => {
    if (!submission) {
      throw new Error('A submission is required to download the application.');
    }

    return submissions.createDocument({
      documentType,
      language: currentLanguage,
      formPath: form.path,
      submission,
      submissionMethod,
      navUnitNumber: selectedNavUnit || undefined,
    });
  };

  return (
    <div className={styles.downloadSection}>
      {requiresNavUnit && navUnitFetchError && (
        <Alert variant="error">{translate(TEXTS.statiske.prepareLetterPage.entityFetchError)}</Alert>
      )}
      {requiresNavUnit && navUnits && navUnits.length > 0 && !navUnitFetchError && (
        <div className={styles.navUnit}>
          <NavUnitSelect
            fieldSize="xlarge"
            marginBottom="space-0"
            statePath="nav-unit"
            units={navUnits}
            description={form.properties.navUnitDescription}
            value={selectedNavUnit}
            onChange={(unitNumber) => {
              setSelectedNavUnit(unitNumber);
              setNavUnitSelectionError(false);
            }}
            error={
              navUnitSelectionError ? translate(TEXTS.statiske.prepareLetterPage.entityNotSelectedError) : undefined
            }
          />
        </div>
      )}
      <DownloadPdfButton
        disabled={requiresNavUnit && (navUnitsLoading || Boolean(navUnitFetchError))}
        fileName={fileName}
        isValid={() => {
          if (requiresNavUnit && (navUnitFetchError || !navUnits)) {
            return false;
          }

          if (requiresNavUnit && navUnits && navUnits.length > 0 && !selectedNavUnit) {
            setNavUnitSelectionError(true);
            return false;
          }

          return true;
        }}
        onClick={() => setDownloadState(undefined)}
        onSuccess={() => {
          setDownloadState('success');
          logEvent?.({
            name: 'last ned',
            data: {
              type: 'soknad',
              tema: form.properties.tema,
              tittel: translate(form.title),
              skjemaId: form.properties.skjemanummer,
              withCoverPage: documentType === 'application-with-cover-page',
              submissionMethod,
              language: currentLanguage,
            },
          });
        }}
        onError={() => setDownloadState('error')}
        pdfContent={getPdfContent}
      >
        {translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
      </DownloadPdfButton>
      {downloadState === 'success' && (
        <Alert variant="info">{translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName })}</Alert>
      )}
      {downloadState === 'error' && (
        <Alert variant="error">{translate(TEXTS.statiske.prepareLetterPage.downloadError)}</Alert>
      )}
    </div>
  );
};

export default ApplicationDownloadSection;
