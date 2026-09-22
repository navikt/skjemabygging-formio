import { BodyShort, Label } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect } from 'react';
import { UnvalidatedFields } from '../../context/validation/ValidationScopeContext';
import { inputId } from '../../utils/inputId';
import Alert from '../alert/Alert';
import CheckboxGroup from '../checkbox-group/CheckboxGroup';
import RadioGroup from '../radio-group/RadioGroup';
import TextArea from '../text-area/TextArea';
import TextField from '../text-field/TextField';
import { attachmentFieldPath } from './attachmentFieldPath';
import { AttachmentChoice, AttachmentChoiceOption, getImplicitAttachmentValue } from './attachmentOptions';

interface Props {
  title: ReactNode;
  required: boolean;
  description: ReactNode;
  error?: ReactNode;
  value?: AttachmentChoice;
  values: AttachmentChoiceOption[];
  onChange: (value: AttachmentChoice | undefined) => void;
  translate: (text: string, params?: Record<string, unknown>) => string;
  deadline?: string;
  className?: string;
  uploadEnabled?: boolean;
  submissionPath?: string;
  attachmentId: string;
  readOnly?: boolean;
}

const AttachmentOptionSelect = ({
  values,
  value,
  title,
  required,
  description,
  error,
  onChange,
  translate,
  deadline,
  className,
  uploadEnabled = false,
  submissionPath,
  attachmentId,
  readOnly,
}: Props) => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'value');
  const implicitValueKey = getImplicitAttachmentValue(values, uploadEnabled);
  const selectedValueKey = value?.value ?? implicitValueKey;
  const selectedOption = values.find((option) => option.value === selectedValueKey);
  const additionalDocumentation = selectedOption?.additionalDocumentation;
  const showDeadline = selectedOption?.showDeadline;

  useEffect(() => {
    if (!implicitValueKey || value?.value === implicitValueKey) {
      return;
    }

    onChange({
      value: implicitValueKey,
      additionalDocumentation: additionalDocumentation ? value?.additionalDocumentation : undefined,
    });
  }, [additionalDocumentation, implicitValueKey, onChange, value?.additionalDocumentation, value?.value]);

  const handleAttachmentChange = (key: string) => {
    onChange(
      key
        ? {
            value: key,
            additionalDocumentation: values.find((option) => option.value === key)?.additionalDocumentation
              ? value?.additionalDocumentation
              : undefined,
          }
        : undefined,
    );
  };

  const handleAdditionalDocumentationChange = (additionalDocumentationValue: string) => {
    if (!selectedValueKey || (uploadEnabled && additionalDocumentationValue.length > 200)) {
      return;
    }

    onChange({ value: selectedValueKey, additionalDocumentation: additionalDocumentationValue });
  };

  return (
    // The attachment object owns these controlled values, while validation and focus use the same
    // state paths as the rest of the form.
    <UnvalidatedFields>
      <div className={className}>
        {implicitValueKey ? (
          <div className="mb-4" id={inputId(statePath)} tabIndex={-1}>
            <Label>{title}</Label>
            <BodyShort>{description}</BodyShort>
            {error && (
              <Alert variant="error" inline>
                {error}
              </Alert>
            )}
          </div>
        ) : values.length === 1 ? (
          <CheckboxGroup
            statePath={statePath}
            legend={typeof title === 'string' ? title : ''}
            required={required}
            readOnly={readOnly}
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
            readOnly={readOnly}
            description={typeof description === 'string' ? description : undefined}
            values={values}
            value={selectedValueKey ?? ''}
            error={error}
            onChange={handleAttachmentChange}
            translateValues={false}
          />
        )}
        {additionalDocumentation?.label &&
          (uploadEnabled ? (
            <TextArea
              statePath={attachmentFieldPath(submissionPath, attachmentId, 'additionalDocumentation')}
              label={translate(additionalDocumentation.label)}
              value={selectedValueKey === value?.value ? (value?.additionalDocumentation ?? '') : ''}
              description={translate(additionalDocumentation.description ?? '')}
              onChange={handleAdditionalDocumentationChange}
              maxLength={200}
              readOnly={readOnly}
            />
          ) : (
            <TextField
              statePath={attachmentFieldPath(submissionPath, attachmentId, 'additionalDocumentation')}
              label={translate(additionalDocumentation.label)}
              description={translate(additionalDocumentation.description ?? '')}
              value={value?.additionalDocumentation ?? ''}
              onChange={handleAdditionalDocumentationChange}
              required={false}
              showOptionalText={false}
              readOnly={readOnly}
              marginBottom="space-16"
            />
          ))}
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
