import { BodyShort, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import PersonalIdUpload from '../../components/attachment/PersonalIdUpload';
import Captcha from '../../components/captcha/Captcha';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../index';
import UploadPersonalIdButtonRow from './UploadPersonalIdButtonRow';

const UploadPersonalIdPage = () => {
  const { translate } = useLanguages();
  const { setTitle, setFormProgressVisible } = useForm();

  useEffect(() => {
    setTitle(TEXTS.statiske.uploadId.title);
    setFormProgressVisible(false);
  }, [setTitle, setFormProgressVisible]);

  return (
    <AttachmentUploadProvider useCaptcha>
      <Captcha />
      <VStack gap="8">
        <BodyShort>{translate(TEXTS.statiske.uploadId.description)}</BodyShort>
        <PersonalIdUpload />
      </VStack>
      <UploadPersonalIdButtonRow />
    </AttachmentUploadProvider>
  );
};

export default UploadPersonalIdPage;
