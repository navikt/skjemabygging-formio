import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { Attachment, getAllAttachmentsPanels } from '../../util/attachment/attachmentsUtil';
import htmlUtils from '../../util/html/htmlUtils';
import makeStyles from '../../util/styles/jss/jss';
import UploadAttachmentsButtonRow from './UploadAttachmentsButtonRow';

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
  const isOtherAttachment = (attachmentType: string) => attachmentType !== 'default';

  const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

  function mapKeysToOptions(object) {
    return Object.keys(object)
      .filter((key) => object[key].enabled === true)
      .map((key) => ({
        value: key,
        label: translate(TEXTS.statiske.attachment[key]),
        upload: shouldEnableUpload(key),
        additionalDocumentation: object[key]?.additionalDocumentation?.enabled && {
          label: translate(object[key]?.additionalDocumentation?.label),
          description: translate(object[key]?.additionalDocumentation?.description),
        },
      }));
  }

  const attachmentPanels: Attachment[] = getAllAttachmentsPanels(form, submission ?? ({} as Submission));

  return (
    <>
      <AttachmentUploadProvider>
        {attachmentPanels.map(({ label, description, attachmentValues, navId, attachmentType }, index) => (
          <AttachmentUpload
            key={navId}
            className={clsx(index !== attachmentPanels.length - 1 && styles.attachmentUpload)}
            label={label}
            description={htmlUtils.extractTextContent(description as string)}
            options={mapKeysToOptions(attachmentValues)}
            attachmentId={navId as string}
            multiple
            otherAttachment={isOtherAttachment(attachmentType as string)}
          />
        ))}
      </AttachmentUploadProvider>
      <UploadAttachmentsButtonRow />
    </>
  );
}

export default AttachmentsUploadPage;
