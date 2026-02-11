import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate } from 'react-router';
import { useAttachmentUpload } from '../../components/attachment/AttachmentUploadContext';
import { attachmentValidator } from '../../components/attachment/attachmentValidator';
import { CancelAndDeleteButton } from '../../components/navigation/CancelAndDeleteButton';
import NavigationButtonRow from '../../components/navigation/NavigationButtonRow';
import { NextButton } from '../../components/navigation/NextButton';
import { PreviousButton } from '../../components/navigation/PreviousButton';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { Attachment } from '../../util/attachment/attachmentsUtil';
import { validateAttachment } from '../../util/form/attachment-validation/attachmentValidation';

const AttachmentsUploadButtonRow = ({ attachments, onError }: { attachments: Attachment[]; onError: () => void }) => {
  const navigate = useNavigate();
  const { baseUrl } = useAppConfig();
  const { search } = useLocation();
  const { translate } = useLanguages();
  const { addError, removeAllErrors, submissionAttachments } = useAttachmentUpload();
  const { activeComponents, form } = useForm();

  const valueValidator = attachmentValidator(translate, ['value']);
  const fileValidator = attachmentValidator(translate, ['fileUploaded']);

  const validateValues = () => {
    const valueErrors = validateAttachment(attachments, submissionAttachments, valueValidator);
    Object.entries(valueErrors).forEach(([attachmentId, errorMessage]) => {
      addError(attachmentId, errorMessage, 'VALUE');
    });
    return Object.values(valueErrors).length === 0;
  };

  const validateFileUploads = () => {
    const fileErrors = validateAttachment(attachments, submissionAttachments, fileValidator);
    Object.entries(fileErrors).forEach(([attachmentId, errorMessage]) => {
      addError(attachmentId, errorMessage, 'FILE');
    });
    return Object.values(fileErrors).length === 0;
  };

  const validateUploadsAndGoNext = () => {
    removeAllErrors();
    let isValid = validateValues();
    isValid = validateFileUploads() && isValid;
    if (isValid) {
      navigate({ pathname: '../oppsummering', search });
    } else {
      onError();
    }
  };

  const validateValuesAndGoNext = () => {
    removeAllErrors();
    const isValid = validateValues();
    if (isValid) {
      navigate({ pathname: '../oppsummering', search });
    } else {
      onError();
    }
  };

  const previousPage = () => {
    const lastComponent = activeComponents.length > 0 ? activeComponents[activeComponents.length - 1] : undefined;
    return lastComponent ? `../${lastComponent.key}` : '';
  };

  return (
    <NavigationButtonRow
      nextButton={
        <NextButton
          onClick={{
            digitalnologin: () => validateUploadsAndGoNext(),
            paper: () => validateValuesAndGoNext(),
            none: () => validateValuesAndGoNext(),
          }}
          label={{
            digitalnologin: translate(TEXTS.grensesnitt.navigation.next),
            paper: translate(TEXTS.grensesnitt.navigation.next),
            none: translate(TEXTS.grensesnitt.navigation.next),
          }}
          href={{
            digitalnologin: `${baseUrl}/${form.path}/oppsummering${search}`,
            paper: `${baseUrl}/${form.path}/oppsummering${search}`,
            none: `${baseUrl}/${form.path}/oppsummering${search}`,
          }}
        />
      }
      previousButton={
        <PreviousButton
          onClick={{
            digitalnologin: () => navigate({ pathname: previousPage(), search }),
            paper: () => navigate({ pathname: previousPage(), search }),
            none: () => navigate({ pathname: previousPage(), search }),
          }}
          label={{
            digitalnologin: translate(TEXTS.grensesnitt.navigation.previous),
            paper: translate(TEXTS.grensesnitt.navigation.previous),
            none: translate(TEXTS.grensesnitt.navigation.previous),
          }}
          href={{
            digitalnologin: previousPage(),
            paper: previousPage(),
            none: previousPage(),
          }}
        />
      }
      cancelButton={<CancelAndDeleteButton />}
    />
  );
};

export default AttachmentsUploadButtonRow;
