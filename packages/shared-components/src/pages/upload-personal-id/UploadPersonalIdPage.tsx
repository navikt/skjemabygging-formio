import AttachmentUpload from '../../components/attachment/AttachmentUpload';
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
  const handleUpload = (value: string) => {
    console.log('Uploading', value);
  };

  return (
    <>
      <FormContainer>
        <AttachmentUpload
          label={'Hvilken legitimasjon ønsker du å bruke?'}
          options={radioOptions}
          vedleggId={'personal-id'}
          onUpload={handleUpload}
        />
        <UploadPersonalIdButtonRow />
      </FormContainer>
    </>
  );
};

export default UploadPersonalIdPage;
