import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import urlUtils from '../../util/url/url';

const AttachmentsUploadButtonRow = ({ attachmentIds }: { attachmentIds: string[] }) => {
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const { formUrl } = useForm();
  const { radioState, addError, uploadedFiles, handleDeleteAllFiles, errors } = useAttachmentUpload();

  const summaryPageUrl = `${formUrl}/oppsummering?${searchParams.toString()}`;
  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const validateAttachments = () => {
    attachmentIds.forEach((attachmentId: string) => {
      if (!radioState[attachmentId]) {
        addError(attachmentId, TEXTS.statiske.attachment.attachmentError);
      }
      if (
        radioState[attachmentId] &&
        radioState[attachmentId] === 'leggerVedNaa' &&
        !uploadedFiles.some((file) => file.attachmentId === attachmentId)
      ) {
        addError(attachmentId, TEXTS.statiske.attachment.attachmentError);
      }
    });
  };

  const nextPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    validateAttachments();
    if (!attachmentIds.some((id) => errors && errors[id])) {
      navigate(summaryPageUrl);
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
