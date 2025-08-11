import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import urlUtils from '../../util/url/url';

const UploadPersonalIdButtonRow = () => {
  const navigate = useNavigate();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();
  const { formUrl } = useForm();
  const [searchParams] = useSearchParams();
  const { uploadedFiles, addError, handleDeleteAttachment } = useAttachmentUpload();

  const startUrl = `${baseUrl}${formUrl}`;
  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const navigateToFormPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (uploadedFiles.find((file) => file.vedleggId === 'personal-id')) {
      navigate(`..?${searchParams.toString()}`);
    } else {
      addError('personal-id', translate(TEXTS.statiske.uploadId.missingUploadError));
    }
  };

  const onCancelAndDelete = async () => {
    try {
      await handleDeleteAttachment('personal-id');
      window.location.href = exitUrl;
    } catch (_e) {
      /* empty */
    }
  };

  return (
    <nav>
      <div className="button-row button-row--center">
        <Button
          variant="primary"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          as="a"
          role="link"
          onClick={navigateToFormPage}
          {...{ href: `${startUrl}?${searchParams.toString()}` }}
        >
          {translate(TEXTS.grensesnitt.navigation.next)}
        </Button>
        <Button
          variant="secondary"
          icon={<ArrowLeftIcon aria-hidden />}
          iconPosition="left"
          onClick={() => navigate(-1)}
        >
          {translate(TEXTS.grensesnitt.goBack)}
        </Button>
      </div>
      <div className="button-row button-row--center">
        <Button variant="tertiary" onClick={onCancelAndDelete}>
          {translate(TEXTS.grensesnitt.navigation.cancelAndDelete)}
        </Button>
      </div>
    </nav>
  );
};

export default UploadPersonalIdButtonRow;
