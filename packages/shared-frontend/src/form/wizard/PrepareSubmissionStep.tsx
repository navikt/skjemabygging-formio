import { Alert, BodyShort, Heading, Link, List, VStack } from '@navikt/ds-react';
import {
  attachmentUtils,
  dateUtils,
  formioFormsApiUtils,
  localizationUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import FormSecondaryButtons from '../FormSecondaryButtons';
import { FormButtonRow, FormHeader, FormPrevButton, useFormDefinition, useSubmissionState } from '../framework';
import DownloadPdfButton from '../fyllut-components/DownloadPdfButton';
import { SUMMARY_KEY } from './constants';

interface Props {
  type: 'application' | 'cover-page-and-application';
}

const PrepareSubmissionStep = ({ type }: Props) => {
  const { translate, currentLanguage } = useFyllutLanguage();
  const { fyllutBaseURL, submissionMethod, logEvent, downloadPdf } = useFyllutAppConfig();
  const { form } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const [downloadState, setDownloadState] = useState<'success' | 'error'>();
  const navForm = useMemo(() => formioFormsApiUtils.mapFormToNavForm(form), [form]);

  const fileName = useMemo(() => `${form.path}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`, [form.path]);
  const attachments = useMemo(
    () => (submission ? attachmentUtils.getAttachmentsForCoverPage(submission, navForm) : []),
    [navForm, submission],
  );
  const showNoSubmissionContent =
    type === 'application' && (!submissionMethod || submissionMethod === 'papernocoverpage');
  const navigationState =
    typeof state === 'object' && state
      ? {
          ...state,
          initialSubmission: submission,
        }
      : {
          initialSubmission: submission,
        };

  const getPdfContent = async () => {
    if (!submission) {
      return undefined;
    }

    return await downloadPdf?.(
      `${fyllutBaseURL}/api/documents${type === 'application' ? '/application' : '/cover-page-and-application'}`,
      {
        language: localizationUtils.getLanguageCodeAsIso639_1(currentLanguage),
        formPath: form.path,
        submission: JSON.stringify(submission),
        submissionMethod,
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
                          href={`${fyllutBaseURL}/${attachment.properties.vedleggskjema}?sub=papernocoverpage`}
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
        <DownloadPdfButton
          fileName={fileName}
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
      <FormSecondaryButtons exitOnly />
      <FormButtonRow
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
