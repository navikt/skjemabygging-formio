import { Alert, BodyShort, Label } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  SubmissionMethod,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode, useEffect } from 'react';
import Select from '../../../components/select/Select';
import TextArea from '../../../components/text-area/TextArea';
import { attachmentValidationPath } from '../../../context/validation/attachmentValidationPath';

interface Props {
  title: ReactNode;
  required: boolean;
  description: ReactNode;
  error?: ReactNode;
  value?: Partial<SubmissionAttachmentValue>;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  onChange: (value: SubmissionAttachmentValue | undefined) => void;
  translate: (text: string, params?: Record<string, unknown>) => string;
  deadline?: string;
  className?: string;
  submissionMethod?: SubmissionMethod;
  attachmentId: string;
}

const AttachmentOptionSelect = forwardRef<HTMLFieldSetElement, Props>(
  (
    {
      attachmentValues,
      value,
      title,
      required,
      description,
      error,
      onChange,
      translate,
      deadline,
      className,
      submissionMethod,
      attachmentId,
    },
    ref,
  ) => {
    const values = attachmentUtils.mapKeysToOptions(attachmentValues, translate, submissionMethod);
    const implicitValueKey = attachmentUtils.getImplicitValueKey(attachmentValues, submissionMethod);
    const selectedValueKey = value?.key ?? implicitValueKey;
    const additionalDocumentation = selectedValueKey
      ? attachmentValues?.[selectedValueKey]?.additionalDocumentation
      : undefined;
    const showDeadline = selectedValueKey ? !!attachmentValues?.[selectedValueKey]?.showDeadline : false;

    useEffect(() => {
      if (!implicitValueKey || value?.key === implicitValueKey) {
        return;
      }

      onChange({
        key: implicitValueKey,
        additionalDocumentation: attachmentValues?.[implicitValueKey]?.additionalDocumentation?.enabled
          ? value?.additionalDocumentation
          : undefined,
      });
    }, [attachmentValues, implicitValueKey, onChange, value?.additionalDocumentation, value?.key]);

    const handleAttachmentChange = (key: string) => {
      onChange(
        key
          ? {
              key: key as SubmissionAttachmentValue['key'],
              additionalDocumentation: attachmentValues?.[key]?.additionalDocumentation?.enabled
                ? value?.additionalDocumentation
                : undefined,
            }
          : undefined,
      );
    };

    const handleAdditionalDocumentationChange = (additionalDocumentationValue: string) => {
      if (!selectedValueKey || additionalDocumentationValue.length > 200) {
        return;
      }

      onChange({ key: selectedValueKey, additionalDocumentation: additionalDocumentationValue });
    };

    return (
      <div className={className}>
        {implicitValueKey ? (
          <div className="mb-4">
            <Label>{title}</Label>
            <BodyShort>{description}</BodyShort>
          </div>
        ) : (
          <Select
            statePath={attachmentValidationPath(attachmentId, 'value')}
            label={typeof title === 'string' ? title : ''}
            required={required}
            description={typeof description === 'string' ? description : undefined}
            values={values}
            value={selectedValueKey ?? ''}
            error={error}
            onChange={handleAttachmentChange}
            presentation={values.length === 1 ? 'checkbox' : 'radio'}
            inputRef={ref}
          />
        )}
        {additionalDocumentation?.enabled && (
          <TextArea
            statePath={`attachments.${attachmentId}.additionalDocumentation`}
            label={translate(additionalDocumentation.label)}
            value={selectedValueKey === value?.key ? (value?.additionalDocumentation ?? '') : ''}
            description={translate(additionalDocumentation.description)}
            onChange={handleAdditionalDocumentationChange}
            maxLength={200}
          />
        )}
        {showDeadline && deadline && (
          <Alert variant="warning" inline>
            {translate(TEXTS.statiske.attachment.deadline, { deadline })}
          </Alert>
        )}
      </div>
    );
  },
);

export default AttachmentOptionSelect;
