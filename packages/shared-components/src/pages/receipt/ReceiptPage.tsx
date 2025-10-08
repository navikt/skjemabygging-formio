import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Heading, Link, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { buildReceiptDocumentItems, getAttachmentsWithFiles, ReceiptDocumentItem } from './receiptUtils';

export function ReceiptPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { submissionMethod, logger } = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const { form, submission, formUrl } = useForm();
  const { soknadPdfBlob, receipt, nologinToken } = useSendInn();

  useEffect(() => {
    if (submissionMethod === 'digitalnologin' && !nologinToken) {
      navigate(`/${formUrl}/legitimasjon${search}`, { replace: true });
    }
  }, [submissionMethod, nologinToken, navigate, formUrl, search]);

  const downloadFileName = useMemo(() => {
    if (!form) {
      return 'soknad-kopi.pdf';
    }

    const skjemanummer = form.properties?.skjemanummer;
    const baseName = skjemanummer || form.path || form.title;

    if (!baseName) {
      return 'soknad-kopi.pdf';
    }

    return `${baseName.toString().replace(/\s+/g, '-').toLowerCase()}-kopi.pdf`;
  }, [form]);

  const submittedAtIso = receipt?.submittedAt;

  const documentsDate = useMemo(() => {
    return dateUtils.toLocaleDate(submittedAtIso, currentLanguage);
  }, [submittedAtIso, currentLanguage]);

  const attachmentsWithFiles = useMemo(() => getAttachmentsWithFiles(submission), [submission]);

  const documentItems: ReceiptDocumentItem[] = useMemo(
    () => buildReceiptDocumentItems(form, attachmentsWithFiles),
    [form, attachmentsWithFiles],
  );

  const formatFileCount = useCallback(
    (count?: number) => {
      if (!count) {
        return undefined;
      }
      const countLabel =
        count === 1
          ? translate(TEXTS.statiske.receipt.singleFileLabel)
          : translate(TEXTS.statiske.receipt.multipleFileLabel);
      return `${count} ${countLabel}`;
    },
    [translate],
  );

  const handleDownloadReceipt = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (!(soknadPdfBlob instanceof Blob)) {
        logger?.error('ReceiptPage: Received invalid soknadPdfBlob, aborting download');
        return;
      }

      const blobUrl = URL.createObjectURL(
        soknadPdfBlob.type ? soknadPdfBlob : new Blob([soknadPdfBlob], { type: 'application/pdf' }),
      );

      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = downloadFileName;
      anchor.rel = 'nofollow noopener';

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      // Allow the browser to start the download before revoking the object URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    },
    [downloadFileName, logger, soknadPdfBlob],
  );

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
                <BodyShort>
                  {item.title}
                  {item.type === 'attachment' && fileCountLabel ? ` (${fileCountLabel})` : null}
                  {item.type === 'main' && soknadPdfBlob ? (
                    <>
                      {' '}
                      <Link href="#" onClick={handleDownloadReceipt}>
                        {translate(TEXTS.statiske.receipt.downloadLinkLabel)}
                      </Link>
                    </>
                  ) : null}
                </BodyShort>
              </List.Item>
            );
          })}
        </List>
      </section>
    </VStack>
  );
}
