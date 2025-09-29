import { BodyShort, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentUploadProvider from '../../components/attachment/AttachmentUploadContext';
import PersonalIdUpload from '../../components/attachment/PersonalIdUpload';
import Captcha from '../../components/captcha/Captcha';
import { useLanguages } from '../../index';
import UploadPersonalIdButtonRow from './UploadPersonalIdButtonRow';

const UploadPersonalIdPage = () => {
  const { translate } = useLanguages();

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
