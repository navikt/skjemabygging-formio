import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Alert, Button } from '@navikt/ds-react';
import { navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import LinkButton from '../../components/link-button/LinkButton';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import urlUtils from '../../util/url/url';

const UploadPersonalIdButtonRow = () => {
  const navigate = useNavigate();
  const { baseUrl, submissionMethod } = useAppConfig();
  const { translate } = useLanguages();
  const { form, formUrl, submission } = useForm();
  const [searchParams] = useSearchParams();
  const { submissionAttachments, errors, addError, handleDeleteAllFiles } = useAttachmentUpload();

  const firstPanelKey = useMemo(() => {
    if (!form) {
      return undefined;
    }
    const panels = navFormUtils.getActivePanelsFromForm(form, submission, submissionMethod);
    return panels?.[0]?.key;
  }, [form, submission, submissionMethod]);

  const targetPath = firstPanelKey ?? 'oppsummering';
  const startUrl = `${baseUrl}/${formUrl}/${targetPath}`;
  const exitUrl = urlUtils.getExitUrl(window.location.href);
  const error = errors['allFiles']?.find((err) => err.type === 'FILE');

  const navigateToFormPage = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const personalIdAttachment = submissionAttachments.find((attachment) => attachment.attachmentId === 'personal-id');
    if (personalIdAttachment?.files?.length) {
      const searchString = searchParams.toString();
      navigate({
        pathname: `../${targetPath}`,
        search: searchString ? `?${searchString}` : '',
      });
    } else {
      addError('personal-id', translate(TEXTS.statiske.uploadId.missingUploadError), 'VALUE');
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
        <LinkButton
          buttonVariant="primary"
          onClick={navigateToFormPage}
          to={`${startUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        >
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
