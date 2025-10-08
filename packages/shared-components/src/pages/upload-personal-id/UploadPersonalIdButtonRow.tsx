import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Alert, Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import LinkButton from '../../components/link-button/LinkButton';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import urlUtils from '../../util/url/url';

const UploadPersonalIdButtonRow = () => {
  const navigate = useNavigate();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();
  const { form } = useForm();
  const [searchParams] = useSearchParams();
  const { submissionAttachments, errors, addError, handleDeleteAllFiles } = useAttachmentUpload();

  const startUrl = `${baseUrl}${form.path}`;
  const exitUrl = urlUtils.getExitUrl(window.location.href);
  const error = errors['allFiles']?.find((err) => err.type === 'FILE');

  const navigateToFormPage = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const personalIdAttachment = submissionAttachments.find((attachment) => attachment.attachmentId === 'personal-id');
    if (!personalIdAttachment?.value) {
      addError('personal-id', translate('required', { field: translate(TEXTS.statiske.uploadId.label) }), 'VALUE');
    } else if (!personalIdAttachment?.files?.length) {
      addError('personal-id', translate(TEXTS.statiske.uploadId.missingUploadError), 'FILE');
    } else {
      navigate(`..?${searchParams.toString()}`);
    }
  };

  const onCancelAndDelete = async () => {
    try {
      await handleDeleteAllFiles();
      window.location.href = exitUrl;
    } catch (_e) {
      /* error handling is done by handleDeleteAllFiles, but we need to stop the navigation */
    }
  };

  return (
    <nav>
      {error && (
        <Alert className="mb" variant="error">
          {error.message}
        </Alert>
      )}
      <div className="button-row button-row--center">
        <LinkButton buttonVariant="primary" onClick={navigateToFormPage} to={`${startUrl}?${searchParams.toString()}`}>
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.navigation.next)}
          </span>
          <span className="navds-button__icon">
            <ArrowRightIcon aria-hidden />
          </span>
        </LinkButton>
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
