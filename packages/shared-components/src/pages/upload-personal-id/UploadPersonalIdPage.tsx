import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import { FormContainer, useLanguages } from '../../index';
import UploadPersonalIdButtonRow from './UploadPersonalIdButtonRow';

const UploadPersonalIdPage = () => {
  const { translate } = useLanguages();

  const radioOptions = [
    { value: 'norwegian-passport', label: translate(TEXTS.statiske.uploadId.norwegianPassport), upload: true },
    { value: 'foreign-passport', label: translate(TEXTS.statiske.uploadId.foreignPassport), upload: true },
    { value: 'national-id-eu', label: translate(TEXTS.statiske.uploadId.nationalIdEU), upload: true },
    { value: 'drivers-license', label: translate(TEXTS.statiske.uploadId.driversLicense), upload: true },
    { value: 'drivers-license-eu', label: translate(TEXTS.statiske.uploadId.driversLicenseEU), upload: true },
  ];

  return (
    <FormContainer>
      <AttachmentUploadProvider>
        <AttachmentUpload
          label={'Hvilken legitimasjon ønsker du å bruke?'}
          options={radioOptions}
          vedleggId={'personal-id'}
          isIdUpload
        />
        <UploadPersonalIdButtonRow />
      </AttachmentUploadProvider>
    </FormContainer>
  );
};

export default UploadPersonalIdPage;
