import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Box, Button, Heading, HStack, Link, List, VStack } from '@navikt/ds-react';
import { dateUtils, Form, ReceiptSummary, stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useNavigationType } from 'react-router';
import { useFormActions } from '../../context/form-actions/FormActionsContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import FormHeader from '../../layout/FormHeader';
import { useFyllut } from '../FyllutContext';

const getMyPageUrl = (url: string) => {
  if (url.includes('.dev.nav.')) {
    return url.includes('ansatt') ? 'https://www.ansatt.dev.nav.no/minside' : 'https://www.intern.dev.nav.no/minside';
  }

  return TEXTS.statiske.external.minSide.url;
};

interface Props {
  form: Pick<Form, 'title' | 'skjemanummer' | 'properties'>;
  receipt?: ReceiptSummary;
  pdf?: Blob;
}

const ReceiptStep = ({ form, receipt, pdf }: Props) => {
  const { logEvent } = useFyllut();
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage, translate } = useLanguage();
  const { status } = useFormActions();
  const navigationType = useNavigationType();

  const soknadPdfUrl = useMemo(() => {
    if (!pdf) {
      return undefined;
    }

    return URL.createObjectURL(pdf);
  }, [pdf]);

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

  if (!receipt || (status === 'submitted' && navigationType === 'POP')) {
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
              {receipt.receivedAttachments.map((attachment, index) => (
                <List.Item
                  key={`${attachment.id}-${index}`}
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
                {receipt.attachmentsToSendLater.map((attachment, index) => (
                  <List.Item key={`${attachment.id}-${index}`}>{attachment.title}</List.Item>
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
                {receipt.attachmentsToBeSentByOthers.map((attachment, index) => (
                  <List.Item key={`${attachment.id}-${index}`}>{attachment.title}</List.Item>
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
