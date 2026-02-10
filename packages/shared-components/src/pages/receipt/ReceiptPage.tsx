import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Box, Heading, HStack, Link, List, VStack } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo } from 'react';
import InnerHtml from '../../components/inner-html/InnerHtml';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import makeStyles from '../../util/styles/jss/jss';

const useStyles = makeStyles({
  downloadLink: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 'var(--ax-font-size-medium)',
    lineHeight: 'var(--ax-font-line-height-medium)',
  },
  downloadLinkIcon: {
    fontSize: 'var(--ax-font-size-xlarge)',
  },
});

export function ReceiptPage() {
  const { setFormProgressVisible, setTitle, form } = useForm();
  const { logEvent, submissionMethod } = useAppConfig();
  const styles = useStyles();
  const { currentLanguage, translate } = useLanguages();
  const { soknadPdfBlob, receipt } = useSendInn();

  useEffect(() => {
    setFormProgressVisible(false);
  }, [setFormProgressVisible]);

  useEffect(() => {
    setTitle(translate(TEXTS.statiske.receipt.title));
  }, [translate, setTitle]);

  const logDownloadPdf = useCallback(() => {
    logEvent?.({
      name: 'last ned',
      data: {
        type: 'soknad',
        tema: form.properties.tema,
        tittel: translate(form.title),
        skjemaId: form.properties.skjemanummer,
        submissionMethod,
        language: currentLanguage,
      },
    });
  }, [currentLanguage, form, logEvent, submissionMethod, translate]);

  const soknadPdfUrl = useMemo(() => {
    return soknadPdfBlob ? URL.createObjectURL(soknadPdfBlob) : undefined;
  }, [soknadPdfBlob]);

  const skalEttersendes = receipt?.attachmentsToSendLater ?? [];
  const skalSendesAvAndre = receipt?.attachmentsToBeSentByOthers ?? [];

  const allRequiredDocumentsSubmitted = skalEttersendes.length === 0 && skalSendesAvAndre.length === 0;

  return (
    <VStack gap="space-32">
      {receipt ? (
        <>
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
                    <Link
                      className={styles.downloadLink}
                      href={soknadPdfUrl}
                      underline={false}
                      target="_blank"
                      onClick={logDownloadPdf}
                      rel="noopener noreferrer"
                    >
                      <DownloadIcon aria-hidden className={styles.downloadLinkIcon} />
                      <span>{translate(TEXTS.statiske.receipt.downloadLinkLabel)}</span>
                    </Link>
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
                    <List.Item key={attachment.id}>
                      <VStack gap="space-4" align="start">
                        <BodyShort>{attachment.title}</BodyShort>
                      </VStack>
                    </List.Item>
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
                    <List.Item key={attachment.id}>
                      <VStack gap="space-4" align="start">
                        <BodyShort>{attachment.title}</BodyShort>
                      </VStack>
                    </List.Item>
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
              <InnerHtml content={translate(TEXTS.statiske.receipt.deadlineWarningBody)} />
            </Alert>
          )}
        </>
      ) : (
        <div>{translate(TEXTS.statiske.error.alreadySubmitted)}</div>
      )}
    </VStack>
  );
}
