import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import OtherAttachmentUpload from '../../components/attachment/OtherAttachmentUpload';
import { useForm } from '../../context/form/FormContext';
import { Attachment, getAllAttachments } from '../../util/attachment/attachmentsUtil';
import htmlUtils from '../../util/html/htmlUtils';
import makeStyles from '../../util/styles/jss/jss';
import AttachmentsUploadButtonRow from './AttachmentsUploadButtonRow';

const useStyles = makeStyles({
  attachmentUpload: {
    borderBottom: '1px solid #C0D6E4',
    paddingBottom: '2rem',
  },
});

export function AttachmentsUploadPage() {
  const { form, submission } = useForm();
  const styles = useStyles();
  const attachments: Attachment[] = getAllAttachments(form, submission ?? ({} as Submission));

  return (
    <AttachmentUploadProvider>
      {attachments.map(({ label, description, attachmentValues, navId, attachmentType }, index) => {
        return attachmentType === 'other' ? (
          <OtherAttachmentUpload
            key={navId}
            className={clsx(index !== attachments.length - 1 && styles.attachmentUpload)}
            label={label}
            description={htmlUtils.extractTextContent(description as string)}
            attachmentValues={attachmentValues}
            componentId={navId as string}
          />
        ) : (
          <AttachmentUpload
            key={navId}
            className={clsx(index !== attachments.length - 1 && styles.attachmentUpload)}
            label={label}
            description={htmlUtils.extractTextContent(description as string)}
            attachmentValues={attachmentValues}
            componentId={navId as string}
            otherAttachment={attachmentType === 'other'}
          />
        );
      })}
      <AttachmentsUploadButtonRow attachments={attachments} />
    </AttachmentUploadProvider>
  );
}

export default AttachmentsUploadPage;
