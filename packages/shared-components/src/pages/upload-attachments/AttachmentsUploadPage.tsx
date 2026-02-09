import { ComponentError, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import OtherAttachmentUpload from '../../components/attachment/OtherAttachmentUpload';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { Attachment, getAllAttachments } from '../../util/attachment/attachmentsUtil';
import htmlUtils from '../../util/html/htmlUtils';
import makeStyles from '../../util/styles/jss/jss';
import FormErrorSummary from '../fill-in-form/FormErrorSummary';
import AttachmentsUploadButtonRow from './AttachmentsUploadButtonRow';

const useStyles = makeStyles({
  attachmentUpload: {
    borderBottom: '1px solid #C0D6E4',
    paddingBottom: '2rem',
  },
});

export function AttachmentsUploadPage() {
  const { form, submission, setTitle, setFormProgressVisible } = useForm();
  const { errors: uploadErrors } = useAttachmentUpload();
  const { translate } = useLanguages();
  const styles = useStyles();
  const attachments: Attachment[] = getAllAttachments(form, submission ?? ({} as Submission));
  const attachmentRefs = useRef<Record<string, HTMLFieldSetElement | HTMLInputElement | HTMLButtonElement | null>>({});
  const errorSummaryRef = useRef<HTMLElement | null>(null);
  const attachmentOrder = attachments.reduce((acc, att, index) => ({ ...acc, [att.navId as string]: index }), {});

  const errors: ComponentError[] = (Object.entries(uploadErrors) ?? []).flatMap(([attachmentId, attachmentErrors]) =>
    attachmentErrors.map((error) => ({
      elementId: error.type,
      message: error.message,
      path: attachmentId,
      level: 'error',
    })),
  );
  errors.sort((a, b) => attachmentOrder[a.path] - attachmentOrder[b.path]);

  const focusOnErrorSummary = (maxAttempts = 5) => {
    if (errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    } else if (maxAttempts > 1) {
      requestAnimationFrame(() => focusOnErrorSummary(--maxAttempts));
    }
  };

  const focusOnComponent = (comp: string | { elementId?: string; path?: string }) => {
    const ref =
      typeof comp === 'string'
        ? attachmentRefs.current[comp]
        : attachmentRefs.current[`${comp.path}-${comp.elementId}`];
    ref?.focus();
  };

  useEffect(() => {
    setTitle(TEXTS.statiske.attachment.title);
    setFormProgressVisible(true);
  }, [setTitle, setFormProgressVisible]);

  return (
    <>
      <FormErrorSummary
        heading={translate(TEXTS.validering.error)}
        errors={errors}
        focusOnComponent={focusOnComponent}
        ref={(ref) => (errorSummaryRef.current = ref)}
      />
      {attachments.map(({ label, description, attachmentValues, navId, attachmentType }, index) => {
        return attachmentType === 'other' ? (
          <OtherAttachmentUpload
            key={navId}
            className={clsx(index !== attachments.length - 1 && styles.attachmentUpload)}
            label={label}
            description={htmlUtils.extractTextContent(description as string)}
            attachmentValues={attachmentValues}
            componentId={navId as string}
            attachmentRefs={attachmentRefs}
          />
        ) : (
          <AttachmentUpload
            key={navId}
            className={clsx(index !== attachments.length - 1 && styles.attachmentUpload)}
            label={label}
            description={htmlUtils.extractTextContent(description as string)}
            attachmentValues={attachmentValues}
            componentId={navId as string}
            refs={attachmentRefs}
          />
        );
      })}
      <AttachmentsUploadButtonRow attachments={attachments} onError={focusOnErrorSummary} />
    </>
  );
}

export default AttachmentsUploadPage;
