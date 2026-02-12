import {
  AttachmentSettingValues,
  AttachmentType,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { MutableRefObject, ReactNode } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import AttachmentOptionSelect from './AttachmentOptionSelect';
import AttachmentUpload from './AttachmentUpload';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentValidator } from './attachmentValidator';
import OtherAttachmentUpload from './OtherAttachmentUpload';
import { findAttachmentByComponentId } from './utils/attachmentUploadUtils';

interface AttachmentProps {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  componentId: string;
  type?: AttachmentType;
  description?: ReactNode;
  className?: string;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
}

const Attachment = ({
  componentId,
  label,
  attachmentValues,
  type = 'default',
  description,
  className,
  refs,
}: AttachmentProps) => {
  const config = useAppConfig();
  const { changeAttachmentValue, submissionAttachments, errors } = useAttachmentUpload();
  const { form } = useForm();
  const { translate } = useLanguages();

  const attachment = findAttachmentByComponentId(submissionAttachments, componentId);
  const enableUpload = attachmentUtils.enableAttachmentUpload(config?.submissionMethod);
  const validator = attachmentValidator(translate, ['value']);
  const attachmentError = errors[componentId]?.find((error) => error.type === 'VALUE');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    changeAttachmentValue(
      attachment ?? { attachmentId: componentId, navId: componentId, type },
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
      validator,
    );
  };

  if (enableUpload) {
    return type === 'other' ? (
      <OtherAttachmentUpload
        key={componentId}
        className={className}
        label={label}
        description={description}
        attachmentValues={attachmentValues}
        componentId={componentId}
        submissionAttachment={attachment}
        onValueChange={handleValueChange}
        error={attachmentError}
        refs={refs}
      />
    ) : (
      <AttachmentUpload
        key={componentId}
        className={className}
        label={label}
        description={description}
        attachmentValues={attachmentValues}
        componentId={componentId}
        submissionAttachment={attachment}
        onValueChange={handleValueChange}
        error={attachmentError}
        type={type as Exclude<AttachmentType, 'other'>}
        refs={refs}
      />
    );
  }

  return (
    <AttachmentOptionSelect
      className={clsx('mb', className)}
      title={label}
      description={description}
      error={attachmentError?.message}
      value={
        attachment?.value
          ? { key: attachment.value, additionalDocumentation: attachment?.additionalDocumentation }
          : undefined
      }
      attachmentValues={attachmentValues}
      onChange={handleValueChange}
      translate={translate}
      deadline={form.properties?.ettersendelsesfrist}
      ref={(ref) => {
        if (refs?.current) {
          // eslint-disable-next-line react-hooks/immutability
          refs.current[`${componentId}-VALUE`] = ref;
        }
      }}
    />
  );
};

export default Attachment;
