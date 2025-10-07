import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Heading, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppConfig } from '../../context/config/configContext';
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
  const navigate = useNavigate();
  const { submissionMethod } = useAppConfig();
  const { translate, currentLanguage } = useLanguages();
  const { form, submission, formUrl } = useForm();
  const { soknadPdfBlob, receipt, nologinToken } = useSendInn();

  useEffect(() => {
    if (submissionMethod === 'digitalnologin' && !nologinToken) {
      navigate(`${formUrl}/legitimasjon`, { replace: true });
    }
  }, [submissionMethod, nologinToken, navigate, formUrl]);

  useEffect(() => {
    if (submissionMethod !== 'digitalnologin') {
      return;
    }

    const handlePopState = () => {
      navigate(`${formUrl}/kvittering${window.location.search}`, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [submissionMethod, navigate, formUrl]);

  const soknadPdfUrl = useMemo(() => {
    return soknadPdfBlob ? URL.createObjectURL(soknadPdfBlob) : undefined;
  }, [soknadPdfBlob]);

  useEffect(() => {
    return () => {
      if (soknadPdfUrl) {
        URL.revokeObjectURL(soknadPdfUrl);
      }
    };
  }, [soknadPdfUrl]);

  const submittedAtIso = receipt?.submittedAt;

  const documentsDate = useMemo(() => {
    return dateUtils.toLocaleDate(submittedAtIso, currentLanguage);
  }, [submittedAtIso, currentLanguage]);

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
    const countLabel =
      count === 1
        ? translate(TEXTS.statiske.receipt.singleFileLabel)
        : translate(TEXTS.statiske.receipt.multipleFileLabel);
    return `${count} ${countLabel}`;
  };

  console.log(form);

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
                </BodyShort>
              </List.Item>
            );
          })}
        </List>
      </section>
    </VStack>
  );
}
