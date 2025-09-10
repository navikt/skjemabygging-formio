import { ComponentError, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useState } from 'react';
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
  const { form, submission } = useForm();
  const { errors: uploadErrors } = useAttachmentUpload();
  const { translate } = useLanguages();
  const styles = useStyles();
  const attachments: Attachment[] = getAllAttachments(form, submission ?? ({} as Submission));
  const [refs, setRefs] = useState<{ [key: string]: HTMLElement | null }>({});

  const errors: ComponentError[] = (Object.entries(uploadErrors) ?? [])
    .filter(([_, error]) => error?.type === 'INPUT')
    .map(([attachmentId, error]) => ({
      elementId: attachmentId,
      message: error!.message,
      path: attachmentId,
      level: 'error',
    }));

  const addRef = (navId: string | undefined, element: HTMLElement | null) => {
    if (!navId || !element) {
      return;
    }
    setRefs((current) => {
      if (current[navId]) {
        return current;
      }
      return { ...current, [navId]: element };
    });
  };

  const focusOnComponent = (comp: string | { elementId?: string; path?: string }) => {
    const ref = typeof comp === 'string' ? refs[comp] : refs[comp.elementId ?? comp.path ?? ''];
    ref?.focus();
  };

  return (
    <>
      <FormErrorSummary
        heading={translate(TEXTS.validering.error)}
        errors={errors}
        focusOnComponent={focusOnComponent}
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
            ref={(element) => addRef(navId, element)}
          />
        ) : (
          <AttachmentUpload
            key={navId}
            className={clsx(index !== attachments.length - 1 && styles.attachmentUpload)}
            label={label}
            description={htmlUtils.extractTextContent(description as string)}
            attachmentValues={attachmentValues}
            componentId={navId as string}
            ref={(element) => addRef(navId, element)}
          />
        );
      })}
      <AttachmentsUploadButtonRow attachments={attachments} />
    </>
  );
}

export default AttachmentsUploadPage;
