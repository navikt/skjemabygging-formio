import { Alert, BodyShort, Box, Button, Heading, HStack, List, VStack } from '@navikt/ds-react';
import { dateUtils, stringUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import FormHeader from '../../layout/FormHeader';
import type { FormRendererRoute, SharedFormRendererProps } from '../types';
import ReceiptDocuments from './ReceiptDocuments';

const toPdfBlob = (base64: string) => {
  const bytes = atob(base64);
  const content = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    content[index] = bytes.charCodeAt(index);
  }
  return new Blob([content], { type: 'application/pdf' });
};

const ReceiptPage = ({
  host,
  route,
}: {
  host: SharedFormRendererProps['host'];
  route: Extract<FormRendererRoute, { kind: 'receipt' }>;
}) => {
  const { form } = useFormDefinition();
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const receipt = route.receipt;
  const pdfUrl = useMemo(
    () => (route.pdfBase64 ? URL.createObjectURL(toPdfBlob(route.pdfBase64)) : undefined),
    [route.pdfBase64],
  );

  useEffect(
    () => () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    },
    [pdfUrl],
  );

  if (!receipt) {
    return (
      <>
        <FormHeader form={form} pageTitle={TEXTS.statiske.receipt.title} />
        <div>{translate(TEXTS.statiske.error.alreadySubmitted)}</div>
      </>
    );
  }

  const allDocumentsSubmitted = !receipt.attachmentsToSendLater.length && !receipt.attachmentsToBeSentByOthers.length;
  return (
    <>
      <FormHeader form={form} pageTitle={TEXTS.statiske.receipt.title} />
      <VStack gap="space-32">
        {allDocumentsSubmitted && (
          <Alert size="medium" variant="success">
            <Heading level="2" spacing size="xsmall">
              {translate(TEXTS.statiske.receipt.alertSuccessHeading)}
            </Heading>
            {translate(TEXTS.statiske.receipt.alertSuccessBody)}
          </Alert>
        )}
        <ReceiptDocuments
          receipt={{ ...receipt, receivedDate: dateUtils.toLocaleDate(receipt.receivedDate) }}
          pdfUrl={pdfUrl}
          onPdfDownloaded={() => host.receipt?.onPdfDownloaded?.(form)}
        />
        {receipt.attachmentsToSendLater.length > 0 && (
          <section>
            <BodyShort size="large">
              <strong>{translate(TEXTS.statiske.receipt.mustSendLaterHeading)}</strong>
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
              <strong>{translate(TEXTS.statiske.receipt.sentByOthersHeading)}</strong>
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
        {!allDocumentsSubmitted && (
          <Alert size="medium" variant="warning">
            <Heading level="2" spacing size="xsmall">
              {translate(TEXTS.statiske.receipt.deadlineWarningHeading, {
                deadline: dateUtils.toLocaleDate(receipt.sendLaterDeadline),
              })}
            </Heading>
            {translate(TEXTS.statiske.receipt.deadlineWarningBody)}
          </Alert>
        )}
        {submissionMethod === 'digital' && host.receipt?.myPageUrl && (
          <HStack gap="space-16">
            <Button as="a" href={host.receipt.myPageUrl} variant="secondary">
              {stringUtils.capitalize(translate(TEXTS.statiske.error.goToMyPage))}
            </Button>
          </HStack>
        )}
      </VStack>
    </>
  );
};

export default ReceiptPage;
