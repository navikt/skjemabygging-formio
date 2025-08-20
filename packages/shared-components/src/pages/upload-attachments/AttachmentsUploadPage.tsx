import { AttachmentOption, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import { mapKeysToOptions } from '../../components/attachment/utils';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { Attachment, getAllAttachmentsPanels } from '../../util/attachment/attachmentsUtil';
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
  const { translate } = useLanguages();
  const { form, submission } = useForm();
  const styles = useStyles();
  const attachmentPanels: Attachment[] = getAllAttachmentsPanels(form, submission ?? ({} as Submission));
  const attachmentIds = attachmentPanels.map((panel) => panel.navId);

  return (
    <>
      <AttachmentUploadProvider>
        {attachmentPanels.map(({ label, description, attachmentValues, navId, attachmentType }, index) => (
          <AttachmentUpload
            key={navId}
            className={clsx(index !== attachmentPanels.length - 1 && styles.attachmentUpload)}
            label={label}
            description={htmlUtils.extractTextContent(description as string)}
            options={mapKeysToOptions(attachmentValues as AttachmentOption[], translate)}
            attachmentId={navId as string}
            otherAttachment={attachmentType === 'other'}
          />
        ))}
        <AttachmentsUploadButtonRow attachmentIds={attachmentIds as string[]} />
      </AttachmentUploadProvider>
    </>
  );
}

export default AttachmentsUploadPage;
