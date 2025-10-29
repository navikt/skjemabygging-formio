import { Alert } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useNavigate, useSearchParams } from 'react-router';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import { CancelButton } from '../../components/navigation/CancelButton';
import { NavigationButtonRow } from '../../components/navigation/NavigationButtonRow';
import { NextButton } from '../../components/navigation/NextButton';
import { PreviousButton } from '../../components/navigation/PreviousButton';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';

const UploadPersonalIdButtonRow = () => {
  const navigate = useNavigate();
  const { baseUrl } = useAppConfig();
  const { translate } = useLanguages();
  const { form } = useForm();
  const [searchParams] = useSearchParams();
  const { submissionAttachments, errors, addError } = useAttachmentUpload();

  const startUrl = `${baseUrl}${form.path}`;
  const error = errors['allFiles']?.find((err) => err.type === 'FILE');

  const navigateToFormPage = () => {
    const personalIdAttachment = submissionAttachments.find((attachment) => attachment.attachmentId === 'personal-id');
    if (!personalIdAttachment?.value) {
      addError('personal-id', translate('required', { field: translate(TEXTS.statiske.uploadId.label) }), 'VALUE');
    } else if (!personalIdAttachment?.files?.length) {
      addError('personal-id', translate(TEXTS.statiske.uploadId.missingUploadError), 'FILE');
    } else {
      navigate(`..?${searchParams.toString()}`);
    }
  };

  return (
    <>
      {error && (
        <Alert className="mb" variant="error">
          {error.message}
        </Alert>
      )}
      <NavigationButtonRow
        nextButton={
          <NextButton
            onClick={{
              digitalnologin: () => navigateToFormPage(),
            }}
            label={{
              digitalnologin: translate(TEXTS.grensesnitt.navigation.next),
            }}
            href={{
              digitalnologin: `${startUrl}?${searchParams.toString()}`,
            }}
          />
        }
        previousButton={
          <PreviousButton
            onClick={{
              digitalnologin: () => navigate(-1),
            }}
            label={{
              digitalnologin: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
            }}
          />
        }
        cancelButton={<CancelButton />}
        saveButton={undefined}
      />
    </>
  );
};

export default UploadPersonalIdButtonRow;
