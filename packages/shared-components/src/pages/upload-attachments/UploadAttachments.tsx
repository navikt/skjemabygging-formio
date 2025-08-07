import { attachmentUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import { OtherAttachment } from '../../components/attachment/OtherAttachment';
import { FormContainer } from '../../components/form/container/FormContainer';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { Attachment, getAttachmentsFromSchemaDefinition } from '../../util/attachment/attachmentsUtil';
import UploadPersonalIdButtonRow from '../upload-personal-id/UploadPersonalIdButtonRow';

export function UploadAttachments() {
  const { translate } = useLanguages();
  const { attachmentKeys, otherAttachmentKeys } = attachmentUtils;
  const { form, submission } = useForm();

  function mapKeysToOptions(keyList) {
    return keyList.map((key: string) => {
      return {
        value: key,
        label: translate(TEXTS.statiske.attachment[key]),
        upload: true,
      };
    });
  }

  const defaultAttachmentOptions = mapKeysToOptions(attachmentKeys);
  const otherAttachmentOptions = mapKeysToOptions(otherAttachmentKeys);

  const attachmentPanels: Attachment[] = getAttachmentsFromSchemaDefinition(form, submission?.data ?? {});

  console.log('attachmentPanels', attachmentPanels); // TODO fortsett her. Undersøk om det er skal gjøres noe med om det er annet vedlegg. Det kan vel bare være en instans?
  return (
    <FormContainer>
      <AttachmentUploadProvider>
        <AttachmentUpload label="Vedlegg" options={defaultAttachmentOptions} vedleggId="attachments" multiple />
        <OtherAttachment label="Annen dokumentasjon" options={otherAttachmentOptions} />
        <UploadPersonalIdButtonRow />
      </AttachmentUploadProvider>
    </FormContainer>
  );
}

export default UploadAttachments;
