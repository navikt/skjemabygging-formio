import { BodyShort, Label } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  SubmissionMethod,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect } from 'react';
import Alert from '../../../components/alert/Alert';
import CheckboxGroup from '../../../components/checkbox-group/CheckboxGroup';
import RadioGroup from '../../../components/radio-group/RadioGroup';
import TextArea from '../../../components/text-area/TextArea';
import { UnvalidatedFields } from '../../../context/validation/ValidationScopeContext';
import { attachmentFieldPath } from '../attachmentFieldPath';

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
  submissionPath?: string;
  attachmentId: string;
}

const AttachmentOptionSelect = ({
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
  submissionPath,
  attachmentId,
}: Props) => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'value');
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
    // The attachment object owns these controlled values, while validation and focus use the same
    // state paths as the rest of the form.
    <UnvalidatedFields>
      <div className={className}>
        {implicitValueKey ? (
          <div className="mb-4">
            <Label>{title}</Label>
            <BodyShort>{description}</BodyShort>
          </div>
        ) : values.length === 1 ? (
          <CheckboxGroup
            statePath={statePath}
            legend={typeof title === 'string' ? title : ''}
            required={required}
            description={typeof description === 'string' ? description : undefined}
            values={values}
            value={selectedValueKey === values[0]?.value ? [selectedValueKey] : []}
            error={error}
            onChange={(selectedValues) => handleAttachmentChange(selectedValues[0] ?? '')}
            translateValues={false}
          />
        ) : (
          <RadioGroup
            statePath={statePath}
            legend={typeof title === 'string' ? title : ''}
            required={required}
            description={typeof description === 'string' ? description : undefined}
            values={values}
            value={selectedValueKey ?? ''}
            error={error}
            onChange={handleAttachmentChange}
            translateValues={false}
          />
        )}
        {additionalDocumentation?.enabled && (
          <TextArea
            statePath={attachmentFieldPath(submissionPath, attachmentId, 'additionalDocumentation')}
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
    </UnvalidatedFields>
  );
};

export default AttachmentOptionSelect;
