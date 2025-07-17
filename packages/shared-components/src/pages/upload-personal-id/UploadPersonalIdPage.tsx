import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { FormContainer } from '../../index';
import UploadPersonalIdButtonRow from './UploadPersonalIdButtonRow';

const radioOptions = [
  { value: 'norwegian-passport', label: 'Norsk pass', upload: true },
  { value: 'foreign-passport', label: 'Utenlandsk pass (ikke nødpass)', upload: true },
  { value: 'national-id-eu', label: 'Nasjonalt ID-kort fra EU/EØS-land og Sveits', upload: true },
  { value: 'drivers-license', label: 'Norsk førerkort utstedt fra og med 01.01.1998', upload: true },
  { value: 'drivers-license-eu', label: 'Førerkort utstedt i EU/EØS og som følger EU/EØS reglene', upload: true },
];

const UploadPersonalIdPage = () => {
  const { innsendingsId, setInnsendingsId } = useSendInn();
  const handleUpload = (value: UploadedFile[]) => {
    console.log('Uploading', value);
    const newInnsendingId = value[0]?.innsendingId;
    if (!innsendingsId && newInnsendingId) {
      setInnsendingsId(newInnsendingId);
    }
  };

  return (
    <>
      <FormContainer>
        <AttachmentUpload
          label={'Hvilken legitimasjon ønsker du å bruke?'}
          options={radioOptions}
          innsendingsId={innsendingsId}
          vedleggId={'personal-id'}
          onUpload={handleUpload}
        />
        <UploadPersonalIdButtonRow />
      </FormContainer>
    </>
  );
};

export default UploadPersonalIdPage;
