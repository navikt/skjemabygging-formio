import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import { attachmentValidator } from '../../components/attachment/attachmentValidator';
import { useLanguages } from '../../context/languages';
import { Attachment } from '../../util/attachment/attachmentsUtil';
import { validateAttachment } from '../../util/form/attachment-validation/attachmentValidation';
import urlUtils from '../../util/url/url';

const AttachmentsUploadButtonRow = ({ attachments, onError }: { attachments: Attachment[]; onError: () => void }) => {
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const { addError, removeAllErrors, submissionAttachments, handleDeleteAllFiles } = useAttachmentUpload();

  const summaryPageUrl = `../oppsummering?${searchParams.toString()}`;
  const exitUrl = urlUtils.getExitUrl(window.location.href);
  const validator = attachmentValidator(translate);

  const nextPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    removeAllErrors();
    const errors = validateAttachment(attachments, submissionAttachments, validator);
    Object.entries(errors).forEach(([attachmentId, errorMessage]) => {
      addError(attachmentId, errorMessage, 'VALUE');
    });
    if (Object.values(errors).length === 0) {
      navigate(summaryPageUrl);
    } else {
      onError();
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
      <div className="button-row button-row--center">
        <Button
          variant="primary"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          as="a"
          role="link"
          onClick={nextPage}
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

export default AttachmentsUploadButtonRow;
