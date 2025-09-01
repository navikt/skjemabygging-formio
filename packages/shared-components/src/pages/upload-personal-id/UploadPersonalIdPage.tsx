import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import AttachmentUpload from '../../components/attachment/AttachmentUpload';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import Captcha from '../../components/captcha/Captcha';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../index';
import UploadPersonalIdButtonRow from './UploadPersonalIdButtonRow';

const UploadPersonalIdPage = () => {
  const { translate } = useLanguages();
  const { setTitle, setFormProgressVisible } = useForm();

  const radioOptions = [
    { value: 'norwegian-passport', label: translate(TEXTS.statiske.uploadId.norwegianPassport), upload: true },
    { value: 'foreign-passport', label: translate(TEXTS.statiske.uploadId.foreignPassport), upload: true },
    { value: 'national-id-eu', label: translate(TEXTS.statiske.uploadId.nationalIdEU), upload: true },
    { value: 'drivers-license', label: translate(TEXTS.statiske.uploadId.driversLicense), upload: true },
    { value: 'drivers-license-eu', label: translate(TEXTS.statiske.uploadId.driversLicenseEU), upload: true },
  ];

  useEffect(() => {
    setTitle(TEXTS.statiske.uploadId.title);
    setFormProgressVisible(false);
  }, [setTitle, setFormProgressVisible]);

  return (
    <AttachmentUploadProvider>
      <Captcha />
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
