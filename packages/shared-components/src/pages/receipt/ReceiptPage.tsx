import { DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Button, Heading, List, Panel, VStack } from '@navikt/ds-react';
import { TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
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
  const { soknadPdfBlob, receipt, nologinToken, innsendingsId: contextInnsendingsId } = useSendInn();

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
  const submittedAt = useMemo(() => {
    if (!submittedAtIso) {
      return undefined;
    }
    return dateUtils.toLocaleDateAndTime(submittedAtIso, currentLanguage);
  }, [submittedAtIso, currentLanguage]);

  const documentsDate = useMemo(() => {
    return dateUtils.toLocaleDate(submittedAtIso, currentLanguage);
  }, [submittedAtIso, currentLanguage]);

  const innsendingsId = useMemo(() => {
    if (contextInnsendingsId) {
      return contextInnsendingsId;
    }
    if (!submission?.attachments) {
      return undefined;
    }
    for (const attachment of submission.attachments) {
      const firstFile = attachment.files?.find((file) => !!file?.innsendingId);
      if (firstFile?.innsendingId) {
        return firstFile.innsendingId;
      }
    }
    return undefined;
  }, [contextInnsendingsId, submission]);

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

  const downloadFileName = useMemo(() => {
    const isoForFile = submittedAtIso ?? new Date().toISOString();
    const formattedDate = dateUtils.toLocaleDate(isoForFile, 'no').replace(/\./g, '');
    const slug = form?.path ?? 'kvittering';
    return `${slug}-${formattedDate}.pdf`;
  }, [form, submittedAtIso]);

  const documentsHeading = translate(TEXTS.statiske.receipt.documentsHeading, { date: documentsDate });

  console.log(form);

  return (
    <div>
      <div>
        <VStack gap="space-8">
          <div>
            <Heading size="small">{form?.title}</Heading>
            <Heading size="xlarge">{translate(TEXTS.statiske.receipt.pageTitle)}</Heading>
          </div>
          <Tag variant="neutral-moderate">Neutral</Tag>
        </VStack>
      </div>

      <br />
      <hr />
      <VStack gap="10">
        <header>
          <Heading level="1" size="large">
            {form?.title}
          </Heading>
          <Heading level="2" size="medium">
            {translate(TEXTS.statiske.receipt.pageTitle)}
          </Heading>
        </header>

        <Panel variant="success">
          <VStack gap="2">
            <BodyShort weight="semibold">{translate(TEXTS.statiske.receipt.heading)}</BodyShort>
            <BodyShort>{translate(TEXTS.statiske.receipt.description)}</BodyShort>
            {submittedAt && (
              <BodyShort>{translate(TEXTS.statiske.receipt.submittedAtLabel, { date: submittedAt })}</BodyShort>
            )}
            {innsendingsId && (
              <BodyShort>{translate(TEXTS.statiske.receipt.innsendingsIdLabel, { innsendingsId })}</BodyShort>
            )}
          </VStack>
        </Panel>

        <section>
          <Heading level="3" size="small">
            {documentsHeading}
          </Heading>
          <List>
            {documentItems.map((item) => {
              const fileCountLabel = formatFileCount(item.fileCount);
              return (
                <List.Item key={item.id}>
                  <BodyShort>
                    {item.title}
                    {item.type === 'attachment' && fileCountLabel ? ` (${fileCountLabel})` : null}
                  </BodyShort>
                </List.Item>
              );
            })}
          </List>
        </section>

        {soknadPdfUrl ? (
          <Button
            as="a"
            href={soknadPdfUrl}
            download={downloadFileName}
            icon={<DownloadIcon aria-hidden />}
            iconPosition="right"
          >
            {translate(TEXTS.statiske.receipt.downloadButton)}
          </Button>
        ) : (
          <Alert variant="warning">{translate(TEXTS.statiske.receipt.missingPdfDescription)}</Alert>
        )}
      </VStack>
    </div>
  );
}
