import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import urlUtils from '../../util/url/url';
import { validateAttachments } from './validate';

const AttachmentsUploadButtonRow = ({ attachmentIds }: { attachmentIds: string[] }) => {
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const { formUrl } = useForm();
  const { radioState, addError, uploadedFiles, handleDeleteAllFiles, errors } = useAttachmentUpload();

  // TODO ta i bruk etter feilsøking
  const _summaryPageUrl = `${formUrl}/oppsummering?${searchParams.toString()}`;
  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const nextPage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    validateAttachments(radioState, attachmentIds, addError, uploadedFiles);
    console.log(errors);
    if (!attachmentIds.some((id) => errors && errors[id])) {
      // navigate(summaryPageUrl);
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
