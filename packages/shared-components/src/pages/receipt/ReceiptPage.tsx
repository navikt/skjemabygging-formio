import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Heading, HStack, Link, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import InnerHtml from '../../components/inner-html/InnerHtml';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import makeStyles from '../../util/styles/jss/jss';
import { useForm } from '../../context/form/FormContext';

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
  const { setFormProgressVisible } = useForm();
  const styles = useStyles();
  const { translate } = useLanguages();
  const { soknadPdfBlob, receipt } = useSendInn();

  useEffect(() => {
    setFormProgressVisible(false);
  }, [setFormProgressVisible]);

  const soknadPdfUrl = useMemo(() => {
    return soknadPdfBlob ? URL.createObjectURL(soknadPdfBlob) : undefined;
  }, [soknadPdfBlob]);

  console.log(soknadPdfUrl);
  console.log(receipt);

  let submitWasCompleteSuccess = true;
  if (receipt?.skalEttersendes.length) {
    submitWasCompleteSuccess = false;
  }

  return (
    <VStack gap="space-32">
      {receipt && (
        <>
          {submitWasCompleteSuccess && (
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
                  date: dateUtils.toLocaleDate(receipt.mottattdato),
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
                  {receipt.label}
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

              {receipt.innsendteVedlegg.map((attachment) => (
                <List.Item
                  key={attachment.vedleggsnr}
                  icon={
                    <CheckmarkCircleFillIcon
                      color="currentColor"
                      style={{ color: 'var(--a-icon-success)' }}
                      fontSize="1.5rem"
                      aria-hidden
                    />
                  }
                >
                  {attachment.tittel}
                </List.Item>
              ))}
            </List>
          </section>

          {receipt.skalEttersendes.length > 0 && (
            <section>
              <BodyShort size="large">
                <b>{translate(TEXTS.statiske.receipt.mustSendLaterHeading)}</b>
              </BodyShort>
              <List>
                {receipt.skalEttersendes.map((attachment) => (
                  <List.Item key={attachment.vedleggsnr}>
                    <VStack gap="1" align="start">
                      <BodyShort>{attachment.tittel}</BodyShort>
                    </VStack>
                  </List.Item>
                ))}
              </List>
            </section>
          )}

          {receipt.skalSendesAvAndre.length > 0 && (
            <section>
              <BodyShort size="large">
                <b>{translate(TEXTS.statiske.receipt.sentByOthersHeading)}</b>
              </BodyShort>
              <List>
                {receipt.skalSendesAvAndre.map((attachment) => (
                  <List.Item key={attachment.vedleggsnr}>
                    <VStack gap="1" align="start">
                      <BodyShort>{attachment.tittel}</BodyShort>
                    </VStack>
                  </List.Item>
                ))}
              </List>
            </section>
          )}

          {!submitWasCompleteSuccess && (
            <Alert size="small" variant="warning">
              <Heading level="2" spacing size="xsmall">
                <b>
                  {translate(TEXTS.statiske.receipt.deadlineWarningHeading, {
                    deadline: dateUtils.toLocaleDate(receipt.ettersendingsfrist),
                  })}
                </b>
              </Heading>
              <InnerHtml content={translate(TEXTS.statiske.receipt.deadlineWarningBody)} />
            </Alert>
          )}
        </>
      )}
    </VStack>
  );
}
