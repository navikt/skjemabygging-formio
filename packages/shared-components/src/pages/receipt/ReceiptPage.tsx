import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Heading, HStack, Link, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import InnerHtml from '../../components/inner-html/InnerHtml';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import makeStyles from '../../util/styles/jss/jss';

const useStyles = makeStyles({
  downloadLink: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 'var(--a-font-size-medium)',
    lineHeight: 'var(--a-font-line-height-medium)',
  },
  downloadLinkIcon: {
    fontSize: 'var(--a-font-size-xlarge)',
  },
});

export function ReceiptPage() {
  const { setFormProgressVisible, setTitle } = useForm();
  const styles = useStyles();
  const { translate } = useLanguages();
  const { soknadPdfBlob, receipt } = useSendInn();

  useEffect(() => {
    setFormProgressVisible(false);
  }, [setFormProgressVisible]);

  useEffect(() => {
    setTitle(translate(TEXTS.statiske.receipt.title));
  }, [translate, setTitle]);

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
            <Alert size="small" variant="success">
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
            <List>
              <List.Item
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
                  {receipt.title}
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
                </HStack>
              </List.Item>

              {receipt.receivedAttachments.map((attachment) => (
                <List.Item
                  key={attachment.id}
                  icon={
                    <CheckmarkCircleFillIcon
                      color="currentColor"
                      style={{ color: 'var(--a-icon-success)' }}
                      fontSize="1.5rem"
                      aria-hidden
                    />
                  }
                >
                  {attachment.title}
                </List.Item>
              ))}
            </List>
          </section>

          {receipt.attachmentsToSendLater.length > 0 && (
            <section>
              <BodyShort size="large">
                <b>{translate(TEXTS.statiske.receipt.mustSendLaterHeading)}</b>
              </BodyShort>
              <List>
                {receipt.attachmentsToSendLater.map((attachment) => (
                  <List.Item key={attachment.id}>
                    <VStack gap="1" align="start">
                      <BodyShort>{attachment.title}</BodyShort>
                    </VStack>
                  </List.Item>
                ))}
              </List>
            </section>
          )}

          {receipt.attachmentsToBeSentByOthers.length > 0 && (
            <section>
              <BodyShort size="large">
                <b>{translate(TEXTS.statiske.receipt.sentByOthersHeading)}</b>
              </BodyShort>
              <List>
                {receipt.attachmentsToBeSentByOthers.map((attachment) => (
                  <List.Item key={attachment.id}>
                    <VStack gap="1" align="start">
                      <BodyShort>{attachment.title}</BodyShort>
                    </VStack>
                  </List.Item>
                ))}
              </List>
            </section>
          )}

          {!allRequiredDocumentsSubmitted && (
            <Alert size="small" variant="warning">
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
