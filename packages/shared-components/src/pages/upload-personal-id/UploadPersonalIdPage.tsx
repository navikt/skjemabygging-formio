import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import { useLanguages } from '../../index';
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
    <AttachmentUploadProvider>
      <AttachmentUpload
        label={translate(TEXTS.statiske.uploadId.label)}
        options={radioOptions}
        attachmentId={'personal-id'}
      />
      <UploadPersonalIdButtonRow />
    </AttachmentUploadProvider>
  );
};

export default UploadPersonalIdPage;
