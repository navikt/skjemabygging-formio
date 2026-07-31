import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Box, Button, Heading, HStack, Link, List, VStack } from '@navikt/ds-react';
import { dateUtils, Form, ReceiptSummary, stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { FormHeader } from '../framework';
import { b64toBlob } from '../fyllut-utils/blob';

const getMyPageUrl = (url: string) => {
  if (url.includes('.dev.nav.')) {
    return url.includes('ansatt') ? 'https://www.ansatt.dev.nav.no/minside' : 'https://www.intern.dev.nav.no/minside';
  }

  return TEXTS.statiske.external.minSide.url;
};

interface Props {
  form: Pick<Form, 'title' | 'skjemanummer' | 'properties'>;
  receipt?: ReceiptSummary;
  pdfBase64?: string;
}

const ReceiptStep = ({ form, receipt, pdfBase64 }: Props) => {
  const { logEvent, submissionMethod } = useFyllutAppConfig();
  const { currentLanguage, translate } = useFyllutLanguage();

  const soknadPdfUrl = useMemo(() => {
    if (!pdfBase64) {
      return undefined;
    }

    return URL.createObjectURL(b64toBlob(pdfBase64, 'application/pdf'));
  }, [pdfBase64]);

  useEffect(() => {
    return () => {
      if (soknadPdfUrl) {
        URL.revokeObjectURL(soknadPdfUrl);
      }
    };
  }, [soknadPdfUrl]);

  const logDownloadPdf = () => {
    logEvent?.({
      name: 'last ned',
      data: {
        type: 'soknad',
        tema: form.properties.tema,
        tittel: translate(form.title),
        skjemaId: form.skjemanummer,
        submissionMethod,
        language: currentLanguage,
      },
    });
  };

  if (!receipt) {
    return (
      <>
        <FormHeader form={form} pageTitle={TEXTS.statiske.receipt.title} />
        <div>{translate(TEXTS.statiske.error.alreadySubmitted)}</div>
      </>
    );
  }

  const allRequiredDocumentsSubmitted =
    receipt.attachmentsToSendLater.length === 0 && receipt.attachmentsToBeSentByOthers.length === 0;

  return (
    <>
      <FormHeader form={form} pageTitle={TEXTS.statiske.receipt.title} />
      <VStack gap="space-32">
        {allRequiredDocumentsSubmitted && (
          <Alert size="medium" variant="success">
            <Heading level="2" spacing size="xsmall">
              {translate(TEXTS.statiske.receipt.alertSuccessHeading)}
            </Heading>
            {translate(TEXTS.statiske.receipt.alertSuccessBody)}
          </Alert>
        )}

        <section>
          <BodyShort size="large">
            <b>
              {translate(TEXTS.statiske.receipt.documentsReceivedHeading, {
                date: dateUtils.toLocaleDate(receipt.receivedDate),
              })}
            </b>
          </BodyShort>
          <Box marginBlock="space-16" asChild>
            <List data-aksel-migrated-v8>
              <List.Item
                icon={
                  <CheckmarkCircleFillIcon
                    color="currentColor"
                    style={{ color: 'var(--ax-text-success-decoration)' }}
                    fontSize="1.5rem"
                    aria-hidden
                  />
                }
              >
                <HStack gap="space-8">
                  {receipt.title}
                  {soknadPdfUrl && (
                    <Link
                      href={soknadPdfUrl}
                      underline={false}
                      target="_blank"
                      onClick={logDownloadPdf}
                      rel="noopener noreferrer"
                    >
                      <DownloadIcon aria-hidden fontSize="1.5rem" />
                      <span>{translate(TEXTS.statiske.receipt.downloadLinkLabel)}</span>
                    </Link>
                  )}
                </HStack>
              </List.Item>
              {receipt.receivedAttachments.map((attachment) => (
                <List.Item
                  key={attachment.id}
                  icon={
                    <CheckmarkCircleFillIcon
                      color="currentColor"
                      style={{ color: 'var(--ax-text-success-decoration)' }}
                      fontSize="1.5rem"
                      aria-hidden
                    />
                  }
                >
                  {attachment.title}
                </List.Item>
              ))}
            </List>
          </Box>
        </section>

        {receipt.attachmentsToSendLater.length > 0 && (
          <section>
            <BodyShort size="large">
              <b>{translate(TEXTS.statiske.receipt.mustSendLaterHeading)}</b>
            </BodyShort>
            <Box marginBlock="space-16" asChild>
              <List data-aksel-migrated-v8>
                {receipt.attachmentsToSendLater.map((attachment) => (
                  <List.Item key={attachment.id}>{attachment.title}</List.Item>
                ))}
              </List>
            </Box>
          </section>
        )}

        {receipt.attachmentsToBeSentByOthers.length > 0 && (
          <section>
            <BodyShort size="large">
              <b>{translate(TEXTS.statiske.receipt.sentByOthersHeading)}</b>
            </BodyShort>
            <Box marginBlock="space-16" asChild>
              <List data-aksel-migrated-v8>
                {receipt.attachmentsToBeSentByOthers.map((attachment) => (
                  <List.Item key={attachment.id}>{attachment.title}</List.Item>
                ))}
              </List>
            </Box>
          </section>
        )}

        {!allRequiredDocumentsSubmitted && (
          <Alert size="medium" variant="warning">
            <Heading level="2" spacing size="xsmall">
              <b>
                {translate(TEXTS.statiske.receipt.deadlineWarningHeading, {
                  deadline: dateUtils.toLocaleDate(receipt.sendLaterDeadline),
                })}
              </b>
            </Heading>
            {translate(TEXTS.statiske.receipt.deadlineWarningBody)}
          </Alert>
        )}

        {submissionMethod === 'digital' && (
          <HStack gap="space-16">
            <Button role="link" as="a" href={translate(getMyPageUrl(window.location.href))} variant="secondary">
              {stringUtils.capitalize(translate(TEXTS.statiske.error.goToMyPage))}
            </Button>
          </HStack>
        )}
      </VStack>
    </>
  );
};

export default ReceiptStep;
