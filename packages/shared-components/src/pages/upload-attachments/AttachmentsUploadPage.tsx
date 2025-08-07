import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import { FormContainer } from '../../components/form/container/FormContainer';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { Attachment, getAttachmentsFromSchemaDefinition } from '../../util/attachment/attachmentsUtil';
import UploadPersonalIdButtonRow from '../upload-personal-id/UploadPersonalIdButtonRow';

export function AttachmentsUploadPage() {
  const { translate } = useLanguages();
  const { form, submission } = useForm();

  function shouldEnableUpload(value: string) {
    return !(value === 'ettersender' || value === 'levertTidligere' || value === 'nei');
  }

  function mapKeysToOptions(object) {
    return Object.keys(object)
      .filter((key) => object[key].enabled === true)
      .map((key) => ({
        value: key,
        label: translate(TEXTS.statiske.attachment[key]),
        upload: shouldEnableUpload(key),
      }));
  }

  const attachmentPanels: Attachment[] = getAttachmentsFromSchemaDefinition(form, submission?.data ?? {});

  return (
    <FormContainer>
      <AttachmentUploadProvider>
        {attachmentPanels.map(({ label, description, attachmentValues, navId }, index) => (
          <AttachmentUpload
            key={index}
            label={label}
            description={description}
            options={mapKeysToOptions(attachmentValues)}
            vedleggId={navId || ''}
            multiple
          />
        ))}
        <UploadPersonalIdButtonRow />
      </AttachmentUploadProvider>
    </FormContainer>
  );
}

export default AttachmentsUploadPage;
