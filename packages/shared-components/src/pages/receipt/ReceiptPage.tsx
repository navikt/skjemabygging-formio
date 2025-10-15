import { CheckmarkCircleFillIcon, DownloadIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Heading, HStack, Link, List, VStack } from '@navikt/ds-react';
import '@navikt/ds-tokens';
import { dateUtils, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  const { form, submission, setFormProgressVisible } = useForm();
  const { soknadPdfBlob, nologinToken } = useSendInn();
  const { submissionMethod } = useAppConfig();
  const navigate = useNavigate();
  const styles = useStyles();
  const pdfUrlRef = useRef<string>();

  const requiresLegitimation = submissionMethod === 'digitalnologin' && !nologinToken;

  // Hide the form progress stepper on receipt page
  useEffect(() => {
    setFormProgressVisible(false);
    return () => {
      setFormProgressVisible(true);
    };
  }, [setFormProgressVisible]);

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

  const submissionAttachments = submission?.attachments;

  const attachmentTitleMap = useMemo(() => {
    if (!form?.components) {
      return new Map<string, string>();
    }

    const map = new Map<string, string>();
    const components = navFormUtils.flattenComponents(form.components) ?? [];

    components.forEach((component) => {
      if (component.type !== 'attachment') {
        return;
      }

      const title =
        component.properties?.vedleggstittel || component.label || component.title || component.key || component.navId;

      if (!title) {
        return;
      }

      const identifiers = [component.navId, component.key, component.id].filter(Boolean) as string[];
      identifiers.forEach((identifier) => {
        if (!map.has(identifier)) {
          map.set(identifier, title);
        }
      });
    });

    return map;
  }, [form?.components]);

  const resolveAttachmentTitle = useCallback(
    (attachment: { attachmentId: string; navId?: string; title?: string }) => {
      if (attachment.title) {
        return attachment.title;
      }

      if (attachment.navId && attachmentTitleMap.has(attachment.navId)) {
        return attachmentTitleMap.get(attachment.navId) as string;
      }

      if (attachmentTitleMap.has(attachment.attachmentId)) {
        return attachmentTitleMap.get(attachment.attachmentId) as string;
      }

      return attachment.attachmentId;
    },
    [attachmentTitleMap],
  );

  const attachmentsWithFiles = useMemo(() => {
    return (submissionAttachments ?? []).filter((attachment) => (attachment.files?.length ?? 0) > 0);
  }, [submissionAttachments]);

  const attachmentsToSendLater = useMemo(() => {
    return (submissionAttachments ?? []).filter((attachment) => attachment.value === 'ettersender');
  }, [submissionAttachments]);

  const attachmentsSentByOthers = useMemo(() => {
    return (submissionAttachments ?? []).filter(
      (attachment) => attachment.value === 'andre' || attachment.value === 'nav',
    );
  }, [submissionAttachments]);

  const ettersendelsesfrist = form?.properties?.ettersendelsesfrist;

  const ettersendingDeadlineIso = useMemo(() => {
    if (!attachmentsToSendLater.length || !ettersendelsesfrist) {
      return undefined;
    }

    const days = Number(ettersendelsesfrist);
    if (Number.isNaN(days) || !Number.isFinite(days) || days <= 0) {
      return undefined;
    }

    return dateUtils.addDays(days);
  }, [attachmentsToSendLater.length, ettersendelsesfrist]);

  const ettersendingDeadline = useMemo(() => {
    if (!ettersendingDeadlineIso) {
      return undefined;
    }

    return dateUtils.toLocaleDate(ettersendingDeadlineIso, currentLanguage);
  }, [ettersendingDeadlineIso, currentLanguage]);

  const shouldShowSuccessAlert = attachmentsToSendLater.length === 0 && attachmentsSentByOthers.length === 0;
  const shouldShowDeadlineAlert = attachmentsToSendLater.length > 0 && !!ettersendingDeadline;

  const receiptTexts = TEXTS.statiske.receipt ?? {};

  const documentItems: DocumentItem[] = useMemo(() => {
    const items: DocumentItem[] = [];
    if (form) {
      items.push({ id: 'main-form', title: form.title, type: 'main' });
    }
    attachmentsWithFiles.forEach((attachment) => {
      items.push({
        id: attachment.attachmentId,
        title: resolveAttachmentTitle(attachment),
        fileCount: attachment.files?.length,
        type: 'attachment',
      });
    });
    return items;
  }, [form, attachmentsWithFiles, resolveAttachmentTitle]);

  const formatFileCount = (count?: number) => {
    if (!count) {
      return undefined;
    }

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
      {shouldShowSuccessAlert && (
        <Alert size="small" variant="success">
          <Heading level="2" spacing size="xsmall">
            {translate(receiptTexts.alertSuccessHeading)}
          </Heading>
          {translate(receiptTexts.alertSuccessBody)}
        </Alert>
      )}

      <section>
        <BodyShort size="large">
          <b>{translate(receiptTexts.documentsHeading, { date: documentsDate })}</b>
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

      {attachmentsToSendLater.length > 0 && (
        <section>
          <BodyShort size="large">
            <b>{translate(receiptTexts.mustSendLaterHeading ?? 'Dette må du ettersende:')}</b>
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
      )}

      {attachmentsSentByOthers.length > 0 && (
        <section>
          <BodyShort size="large">
            <b>{translate(receiptTexts.sentByOthersHeading ?? 'Dette har du svart at noen andre skal sende inn:')}</b>
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
      )}

      {shouldShowDeadlineAlert && (
        <Alert size="small" variant="warning">
          <BodyShort size="large">
            <b>
              {translate(receiptTexts.deadlineWarningTitle ?? 'Dokumentene må ettersendes innen {{deadline}}', {
                deadline: ettersendingDeadline,
              })}
            </b>
          </BodyShort>
          <BodyShort>
            {translate(receiptTexts.deadlineWarningDescriptionPrefix ?? 'Du kan ettersende dokumentene på')}{' '}
            <Link
              href={receiptTexts.deadlineWarningLinkUrl ?? 'https://www.nav.no/ettersende'}
              target="_blank"
              rel="noopener noreferrer"
            >
              {translate(receiptTexts.deadlineWarningLinkLabel ?? 'nav.no/ettersende')}
            </Link>{' '}
            {translate(receiptTexts.deadlineWarningDescriptionSuffix ?? '(åpnes i en ny fane)')}
          </BodyShort>
        </Alert>
      )}
    </VStack>
  );
}
