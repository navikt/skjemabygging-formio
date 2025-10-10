import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Heading, HStack, Link, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import makeStyles from '../../util/styles/jss/jss';

type DocumentItem = {
  id: string;
  title: string;
  fileCount?: number;
  type: 'main' | 'attachment';
};

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
  const { translate, currentLanguage } = useLanguages();
  const { form, submission } = useForm();
  const { soknadPdfBlob, nologinToken } = useSendInn();
  const { submissionMethod } = useAppConfig();
  const navigate = useNavigate();
  const styles = useStyles();
  const pdfUrlRef = useRef<string>();

  const requiresLegitimation = submissionMethod === 'digitalnologin' && !nologinToken;

  useEffect(() => {
    if (!form || !requiresLegitimation) {
      return;
    }

    const search = window.location.search ?? '';
    navigate(`/${form.path}/legitimasjon${search}`, { replace: true });
  }, [requiresLegitimation, form, navigate]);

  const soknadPdfUrl = useMemo(() => {
    return soknadPdfBlob ? URL.createObjectURL(soknadPdfBlob) : undefined;
  }, [soknadPdfBlob]);

  useEffect(() => {
    if (pdfUrlRef.current && pdfUrlRef.current !== soknadPdfUrl) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }
    pdfUrlRef.current = soknadPdfUrl;

    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = undefined;
      }
    };
  }, [soknadPdfUrl]);

  const documentsDate = useMemo(() => {
    return dateUtils.toLocaleDate(undefined, currentLanguage);
  }, [currentLanguage]);

  const attachmentsWithFiles = useMemo(() => {
    return (submission?.attachments ?? []).filter((attachment) => (attachment.files?.length ?? 0) > 0);
  }, [submission]);

  const documentItems: DocumentItem[] = useMemo(() => {
    const items: DocumentItem[] = [];
    if (form) {
      items.push({ id: 'main-form', title: form.title, type: 'main' });
    }
    attachmentsWithFiles.forEach((attachment) => {
      items.push({
        id: attachment.attachmentId,
        title: attachment.title ?? attachment.attachmentId,
        fileCount: attachment.files?.length,
        type: 'attachment',
      });
    });
    return items;
  }, [form, attachmentsWithFiles]);

  const formatFileCount = (count?: number) => {
    if (!count) {
      return undefined;
    }

    const receiptTexts = TEXTS.statiske.receipt ?? {};
    const singleLabel = receiptTexts.singleFileLabel ?? 'fil';
    const multipleLabel = receiptTexts.multipleFileLabel ?? 'filer';
    const label = count === 1 ? translate(singleLabel) : translate(multipleLabel);

    return `${count} ${label}`;
  };

  if (!form || requiresLegitimation) {
    return null;
  }

  return (
    <VStack gap="space-32">
      <Alert size="small" variant="success">
        <Heading level="2" spacing size="xsmall">
          {translate(TEXTS.statiske.receipt.alertSuccessHeading)}
        </Heading>
        {translate(TEXTS.statiske.receipt.alertSuccessBody)}
      </Alert>
      <section>
        <BodyShort size="large">
          <b>{translate(TEXTS.statiske.receipt.documentsHeading, { date: documentsDate })}</b>
        </BodyShort>
        <List>
          {documentItems.map((item) => {
            const fileCountLabel = formatFileCount(item.fileCount);
            return (
              <List.Item
                key={item.id}
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
                  {item.title}
                  {item.type === 'attachment' && fileCountLabel ? ` (${fileCountLabel})` : null}
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
      </section>
    </VStack>
  );
}
