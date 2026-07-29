import { Alert, BodyShort, Button, Heading, Link, List, VStack } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { FormButtonRow, FormPrevButton } from '../../layout/FormButtonRow';
import FormHeader from '../../layout/FormHeader';
import type { SharedFormRendererProps } from '../types';
import SecondaryActions from '../wizard/SecondaryActions';
import useRendererNavigation from '../wizard/useRendererNavigation';

const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  try {
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
};

const PrepareSubmissionPage = ({
  host,
  type,
}: {
  host: SharedFormRendererProps['host'];
  type: 'application' | 'cover-page-and-application';
}) => {
  const { form } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { translate, currentLanguage } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const navigate = useRendererNavigation(host);
  const [downloadState, setDownloadState] = useState<'success' | 'error'>();
  const attachments = useMemo(
    () => (submission ? (host.pdf?.getCoverPageAttachments?.(form, submission) ?? []) : []),
    [form, host.pdf, submission],
  );
  const fileName = `${form.path}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;
  const noSubmissionContent = type === 'application' && (!submissionMethod || submissionMethod === 'papernocoverpage');

  const download = async () => {
    if (!host.pdf || !submission) {
      return;
    }
    setDownloadState(undefined);
    try {
      const content = await host.pdf.createPdf({ form, submission, language: currentLanguage, submissionMethod, type });
      if (content) {
        downloadBlob(content, fileName);
        host.pdf.onDownloaded?.({ form, language: currentLanguage, submissionMethod, type });
        setDownloadState('success');
      }
    } catch {
      setDownloadState('error');
    }
  };

  return (
    <>
      <FormHeader
        form={form}
        pageTitle={
          noSubmissionContent
            ? translate(form.properties.innsendingOverskrift ?? TEXTS.statiske.prepareLetterPage.subTitle)
            : translate(TEXTS.statiske.prepareLetterPage.subTitle)
        }
      />
      <VStack gap="space-24">
        {noSubmissionContent ? (
          <BodyShort>{translate(form.properties.innsendingForklaring)}</BodyShort>
        ) : (
          <>
            <BodyShort>{translate(TEXTS.statiske.prepareLetterPage.firstDescription)}</BodyShort>
            {!!attachments.length && (
              <section aria-label={translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)}>
                <Heading level="2" size="small" spacing>
                  {translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)}
                </Heading>
                <List data-aksel-migrated-v8>
                  {attachments.map((attachment) => {
                    const attachmentFormPath =
                      attachment.attachmentType === 'default' ? attachment.properties?.vedleggskjema : undefined;
                    const attachmentFormUrl =
                      attachmentFormPath && host.pdf?.getAttachmentFormUrl?.(attachmentFormPath);

                    return (
                      <List.Item key={attachment.key}>
                        {attachmentFormUrl ? (
                          <Link href={attachmentFormUrl} target="_blank" rel="noopener noreferrer">
                            {translate(attachment.label)}
                          </Link>
                        ) : (
                          translate(attachment.label)
                        )}
                      </List.Item>
                    );
                  })}
                </List>
              </section>
            )}
          </>
        )}
        <Button onClick={() => void download()}>{translate(TEXTS.grensesnitt.downloadApplication)}</Button>
        {downloadState === 'success' && (
          <Alert variant="info">{translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName })}</Alert>
        )}
        {downloadState === 'error' && (
          <Alert variant="error">{translate(TEXTS.statiske.prepareLetterPage.downloadError)}</Alert>
        )}
      </VStack>
      <SecondaryActions host={host} exitOnly />
      <FormButtonRow
        previousButton={
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.previous)}
            onClick={() => navigate({ kind: 'summary' })}
          />
        }
      />
    </>
  );
};

export default PrepareSubmissionPage;
