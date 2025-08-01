import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import { OtherAttachment } from '../../components/attachment/OtherAttachment';
import { FormContainer } from '../../components/form/container/FormContainer';
import UploadPersonalIdButtonRow from '../upload-personal-id/UploadPersonalIdButtonRow';

export function UploadAttachments() {
  // TODO hvor kommer disse fra for hvert skjema?
  const radioOptions = [
    { value: 'now', label: 'Jeg laster oppdette nå', upload: true },
    { value: 'later', label: 'Jeg ettersender senere', upload: true },
    { value: 'alreadySentIn', label: 'Jeg har levert denne dokumentasjonen tidligere', upload: true },
    { value: 'notAvailable', label: 'Jeg har ikke denne dokumentasjonen', upload: true },
    { value: 'other', label: 'Sendes inn av andre (for eksempel lege, arbeidsgiver)', upload: true },
    { value: 'navRetrieves', label: 'Jeg ønsker at Nav innhenter denne dokumentasjonen', upload: true },
  ];

  const otherOptions = [
    { value: 'yes', label: 'Jeg laster oppdette nå', upload: true },
    { value: 'no', label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved', upload: false },
  ];

  return (
    <FormContainer>
      <AttachmentUploadProvider>
        <AttachmentUpload label="Vedlegg" options={radioOptions} vedleggId="attachments" multiple />
        <OtherAttachment label="Annen dokumentasjon" options={otherOptions} />
        <UploadPersonalIdButtonRow />
      </AttachmentUploadProvider>
    </FormContainer>
  );
}

export default UploadAttachments;
