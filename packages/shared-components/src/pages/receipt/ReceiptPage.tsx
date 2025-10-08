import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Heading, Link, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';

type DocumentItem = {
  id: string;
  title: string;
  fileCount?: number;
  type: 'main' | 'attachment';
};

export function ReceiptPage() {
  const { translate, currentLanguage } = useLanguages();
  const { form, submission } = useForm();
  const { soknadPdfBlob } = useSendInn();

  const soknadPdfUrl = useMemo(() => {
    return soknadPdfBlob ? URL.createObjectURL(soknadPdfBlob) : undefined;
  }, [soknadPdfBlob]);

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

  return form ? (
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
                      <Link href={soknadPdfUrl}>{translate(TEXTS.statiske.receipt.downloadLinkLabel)}</Link>
                    </>
                  ) : null}
                </BodyShort>
              </List.Item>
            );
          })}
        </List>
      </section>
    </VStack>
  ) : (
    <></>
  );
}
