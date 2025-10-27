import { Alert, BodyShort, Heading, Link, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';

export function ReceiptPage() {
  const { form } = useForm();
  const { translate } = useLanguages();
  const { soknadPdfBlob, receipt } = useSendInn();

  const soknadPdfUrl = useMemo(() => {
    return soknadPdfBlob ? URL.createObjectURL(soknadPdfBlob) : undefined;
  }, [soknadPdfBlob]);

  console.log(soknadPdfUrl);

  console.log(receipt);

  const shouldShowSuccessAlert = true;

  return (
    <VStack gap="space-32">
      {form && (
        <>
          {shouldShowSuccessAlert && (
            <Alert size="small" variant="success">
              <Heading level="2" spacing size="xsmall">
                {translate(TEXTS.statiske.receipt.alertSuccessHeading)}
              </Heading>
              {translate(TEXTS.statiske.receipt.alertSuccessBody)}
            </Alert>
          )}

          {receipt && (
            <section>
              <BodyShort size="large">
                <b>{translate(TEXTS.statiske.receipt.documentsHeading)}</b>
              </BodyShort>
              <List>
                <List.Item>
                  {receipt.label}
                  <Link href={soknadPdfUrl}>Last ned kopi</Link>
                </List.Item>
                {receipt.innsendteVedlegg.map((vedlegg) => (
                  <List.Item key={vedlegg.vedleggsnr}>{vedlegg.tittel}</List.Item>
                ))}
              </List>
            </section>
          )}

          {/*           <section>
            <BodyShort size="large">
              <b>{translate(TEXTS.statiske.receipt.documentsHeading)}</b>
            </BodyShort>
            <List>
              {receipt?.innsendteVedlegg.map((item) => {
                return (
                  <List.Item
                    key={item.vedleggsnr}
                    icon={
                      <CheckmarkCircleFillIcon
                        color="currentColor"
                        style={{ color: 'var(--a-icon-success)' }}
                        fontSize="1.5rem"
                        aria-hidden
                      />
                    }
                  >
                    <HStack gap="2">
                      {item.type === 'main' && soknadPdfBlob ? (
                        <Link
                          className={styles.downloadLink}
                          href={soknadPdfUrl}
                          underline={false}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <DownloadIcon aria-hidden className={styles.downloadLinkIcon} />
                          <span>{translate(TEXTS.statiske.receipt.downloadLinkLabel)}</span>
                        </Link>
                      ) : null}
                    </HStack>
                  </List.Item>
                );
              })}
            </List>
          </section> */}

          {/* {attachmentsToSendLater.length > 0 && (
            <section>
              <BodyShort size="large">
                <b>{translate(TEXTS.statiske.receipt.mustSendLaterHeading ?? 'Dette må du ettersende:')}</b>
              </BodyShort>
              <List>
                {attachmentsToSendLater.map((attachment) => (
                  <List.Item key={attachment.attachmentId}>
                    <VStack gap="1" align="start">
                      <BodyShort>{resolveAttachmentTitle(attachment)}</BodyShort>
                      {attachment.additionalDocumentation ? (
                        <BodyShort size="small">{attachment.additionalDocumentation}</BodyShort>
                      ) : null}
                    </VStack>
                  </List.Item>
                ))}
              </List>
            </section>
          )} */}

          {/*           {attachmentsSentByOthers.length > 0 && (
            <section>
              <BodyShort size="large">
                <b>{translate(TEXTS.statiske.receipt.sentByOthersHeading ?? 'Dette har du svart at noen andre skal sende inn:')}</b>
              </BodyShort>
              <List>
                {attachmentsSentByOthers.map((attachment) => (
                  <List.Item key={attachment.attachmentId}>
                    <VStack gap="1" align="start">
                      <BodyShort>{resolveAttachmentTitle(attachment)}</BodyShort>
                      {attachment.additionalDocumentation ? (
                        <BodyShort size="small">{attachment.additionalDocumentation}</BodyShort>
                      ) : null}
                    </VStack>
                  </List.Item>
                ))}
              </List>
            </section>
          )} */}

          {/*           {shouldShowDeadlineAlert && (
            <Alert size="small" variant="warning">
              <Heading level="2" spacing size="xsmall">
                <b>
                  {translate(TEXTS.statiske.receipt.deadlineWarningTitle ?? 'Dokumentene må ettersendes innen {{deadline}}', {
                    deadline: ettersendingDeadline,
                  })}
                </b>
              </Heading>
              {translate(TEXTS.statiske.receipt.deadlineWarningDescriptionPrefix ?? 'Du kan ettersende dokumentene på')}{' '}
              <Link
                href={receiptTexts.deadlineWarningLinkUrl ?? 'https://www.nav.no/ettersende'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translate(TEXTS.statiske.receipt.deadlineWarningLinkLabel ?? 'nav.no/ettersende')}
              </Link>{' '}
              {translate(TEXTS.statiske.receipt.deadlineWarningDescriptionSuffix ?? '(åpnes i en ny fane)')}
            </Alert>
          )} */}
        </>
      )}
    </VStack>
  );
}
