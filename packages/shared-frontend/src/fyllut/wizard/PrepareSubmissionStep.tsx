import { Alert, BodyShort, Heading, Link, List, VStack } from '@navikt/ds-react';
import {
  attachmentUtils,
  dateUtils,
  Enhet,
  formioFormsApiUtils,
  localizationUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import NavUnitSelect from '../../components/nav-unit-select/NavUnitSelect';
import { filterNavUnits, sortNavUnits } from '../../components/nav-unit-select/navUnitUtils';
import { useApplication } from '../../context/application/ApplicationContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import { FormButtonRow, FormPrevButton } from '../../layout/FormButtonRow';
import FormHeader from '../../layout/FormHeader';
import { withoutSubmissionNavigationState } from '../../utils/navigationState';
import DownloadPdfButton from '../fyllut-components/DownloadPdfButton';
import { useFyllut } from '../FyllutContext';
import CancelAndDeleteButton from '../navigation/CancelAndDeleteButton';
import { SUMMARY_KEY } from './constants';

interface Props {
  type: 'application' | 'cover-page-and-application';
}

const PrepareSubmissionStep = ({ type }: Props) => {
  const { translate, currentLanguage } = useLanguage();
  const { fyllutBaseUrl, http, logEvent, downloadPdf } = useFyllut();
  const { logger } = useApplication();
  const { submissionMethod } = useSubmissionMethod();
  const { form } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const [downloadState, setDownloadState] = useState<'success' | 'error'>();
  const [navUnits, setNavUnits] = useState<Enhet[]>();
  const [navUnitFetchError, setNavUnitFetchError] = useState(false);
  const [selectedNavUnit, setSelectedNavUnit] = useState('');
  const [navUnitSelectionError, setNavUnitSelectionError] = useState(false);
  const navForm = useMemo(() => formioFormsApiUtils.mapFormToNavForm(form), [form]);
  const requiresNavUnit =
    type === 'cover-page-and-application' && form.properties.enhetMaVelgesVedPapirInnsending === true;

  const fileName = useMemo(() => `${form.path}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`, [form.path]);
  const attachments = useMemo(
    () => (submission ? attachmentUtils.getAttachmentsForCoverPage(submission, navForm) : []),
    [navForm, submission],
  );
  const showNoSubmissionContent =
    type === 'application' && (!submissionMethod || submissionMethod === 'papernocoverpage');
  const navigationState = withoutSubmissionNavigationState(state);

  useEffect(() => {
    if (!requiresNavUnit) {
      return;
    }

    const loadNavUnits = async () => {
      setNavUnitFetchError(false);
      setNavUnits(undefined);
      try {
        const units = await http?.get<Enhet[]>(`${fyllutBaseUrl}/api/enhetsliste`);
        if (!units) {
          throw new Error('NAV unit HTTP client is unavailable.');
        }

        const filteredUnits = filterNavUnits(units, form.properties.enhetstyper);
        if (filteredUnits.length === 0) {
          logger?.error?.('No relevant NAV units found', {
            skjemanummer: form.properties.skjemanummer,
            enhetstyper: form.properties.enhetstyper,
          });
          setNavUnits(sortNavUnits(units));
          return;
        }

        setNavUnits(filteredUnits);
      } catch {
        setNavUnitFetchError(true);
      }
    };

    loadNavUnits();
  }, [form.properties.enhetstyper, form.properties.skjemanummer, fyllutBaseUrl, http, logger, requiresNavUnit]);

  const getPdfContent = async () => {
    if (!submission) {
      return undefined;
    }

    return await downloadPdf?.(
      `${fyllutBaseUrl}/api/documents${type === 'application' ? '/application' : '/cover-page-and-application'}`,
      {
        language: localizationUtils.getLanguageCodeAsIso639_1(currentLanguage),
        formPath: form.path,
        submission: JSON.stringify(submission),
        submissionMethod,
        enhetNummer: selectedNavUnit || undefined,
      },
    );
  };

  return (
    <>
      <FormHeader
        form={form}
        pageTitle={
          showNoSubmissionContent
            ? translate(form.properties.innsendingOverskrift ?? TEXTS.statiske.prepareLetterPage.subTitle)
            : translate(TEXTS.statiske.prepareLetterPage.subTitle)
        }
      />
      <VStack gap="space-24">
        {showNoSubmissionContent ? (
          <BodyShort>{translate(form.properties.innsendingForklaring)}</BodyShort>
        ) : (
          <>
            <BodyShort>{translate(TEXTS.statiske.prepareLetterPage.firstDescription)}</BodyShort>
            {attachments.length > 0 && (
              <section aria-label={translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)}>
                <Heading level="2" size="small" spacing>
                  {translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)}
                </Heading>
                <List>
                  {attachments.map((attachment) => (
                    <List.Item key={attachment.key}>
                      {attachment.attachmentType === 'default' && attachment.properties?.vedleggskjema ? (
                        <Link
                          href={`${fyllutBaseUrl}/${attachment.properties.vedleggskjema}?sub=papernocoverpage`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {translate(attachment.label)}
                        </Link>
                      ) : (
                        translate(attachment.label)
                      )}
                    </List.Item>
                  ))}
                </List>
              </section>
            )}
          </>
        )}
        {requiresNavUnit && navUnitFetchError && (
          <Alert variant="error">{translate(TEXTS.statiske.navUnit.fetchError)}</Alert>
        )}
        {requiresNavUnit && navUnits && !navUnitFetchError && (
          <NavUnitSelect
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
        )}
        <DownloadPdfButton
          fileName={fileName}
          isValid={() => {
            if (requiresNavUnit && (navUnitFetchError || !navUnits)) {
              return false;
            }

            if (requiresNavUnit && !selectedNavUnit) {
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
                withCoverPage: type === 'cover-page-and-application',
                submissionMethod,
                language: currentLanguage,
              },
            });
          }}
          onError={() => setDownloadState('error')}
          pdfContent={getPdfContent}
        >
          {translate(TEXTS.grensesnitt.downloadApplication)}
        </DownloadPdfButton>
        {downloadState === 'success' && (
          <Alert variant="info">
            {translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, {
              fileName,
            })}
          </Alert>
        )}
        {downloadState === 'error' && (
          <Alert variant="error">{translate(TEXTS.statiske.prepareLetterPage.downloadError)}</Alert>
        )}
      </VStack>
      <FormButtonRow
        cancelButton={<CancelAndDeleteButton exitOnly />}
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={() => navigate({ pathname: `../${SUMMARY_KEY}`, search }, { state: navigationState })}
          />
        }
      />
    </>
  );
};

export default PrepareSubmissionStep;
