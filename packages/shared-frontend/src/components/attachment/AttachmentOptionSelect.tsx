import { Label } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect } from 'react';
import { useValidationExternalError, useValidationFieldError } from '../../context/validation/ValidationContext';
import { UnvalidatedFields, useOptionalValidationScope } from '../../context/validation/ValidationScopeContext';
import { inputId } from '../../utils/inputId';
import Alert from '../alert/Alert';
import CheckboxGroup from '../checkbox-group/CheckboxGroup';
import RadioGroup from '../radio-group/RadioGroup';
import FieldError from '../shared/FieldError';
import TranslatedDescription from '../shared/TranslatedDescription';
import TextArea from '../text-area/TextArea';
import TextField from '../text-field/TextField';
import { attachmentFieldPath } from './attachmentFieldPath';
import { AttachmentChoice, AttachmentChoiceOption, getImplicitAttachmentValue } from './attachmentOptions';
import styles from './AttachmentOptionSelect.module.css';

interface Props {
  title: ReactNode;
  required: boolean;
  description?: string;
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
  choiceLocked?: boolean;
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
  choiceLocked = false,
}: Props) => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'value');
  const implicitValueKey = getImplicitAttachmentValue(values, uploadEnabled);
  const selectedValueKey = value?.value ?? implicitValueKey;
  const selectedOption = values.find((option) => option.value === selectedValueKey);
  const additionalDocumentation = selectedOption?.additionalDocumentation;
  const showDeadline = selectedOption?.showDeadline;
  const additionalDocumentationPath = attachmentFieldPath(submissionPath, attachmentId, 'additionalDocumentation');
  const pageKey = useOptionalValidationScope()?.pageKey;
  const documentationError = useValidationFieldError(additionalDocumentationPath, pageKey);
  const externalDocumentationError = useValidationExternalError(additionalDocumentationPath);

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
        {implicitValueKey || choiceLocked ? (
          <div className={styles.implicitChoice} id={inputId(statePath)} tabIndex={-1}>
            <Label>{title}</Label>
            {description && <TranslatedDescription translationKey={description} />}
            {error && <FieldError id={`${inputId(statePath)}-error`} error={error} />}
          </div>
        ) : values.length === 1 ? (
          <CheckboxGroup
            marginBottom={additionalDocumentation?.label || (showDeadline && deadline) ? 'space-16' : 'space-0'}
            statePath={statePath}
            legend={typeof title === 'string' ? title : ''}
            required={required}
            readOnly={readOnly}
            description={description}
            values={values}
            value={selectedValueKey === values[0]?.value ? [selectedValueKey] : []}
            error={error}
            onChange={(selectedValues) => handleAttachmentChange(selectedValues[0] ?? '')}
            translateValues={false}
          />
        ) : (
          <RadioGroup
            marginBottom={additionalDocumentation?.label || (showDeadline && deadline) ? 'space-16' : 'space-0'}
            statePath={statePath}
            legend={typeof title === 'string' ? title : ''}
            required={required}
            readOnly={readOnly}
            description={description}
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
              marginBottom={showDeadline && deadline ? 'space-16' : 'space-0'}
              statePath={additionalDocumentationPath}
              error={documentationError ?? externalDocumentationError}
              label={translate(additionalDocumentation.label)}
              value={selectedValueKey === value?.value ? (value?.additionalDocumentation ?? '') : ''}
              description={translate(additionalDocumentation.description ?? '')}
              onChange={handleAdditionalDocumentationChange}
              maxLength={200}
              required={false}
              readOnly={readOnly}
            />
          ) : (
            <TextField
              statePath={additionalDocumentationPath}
              error={documentationError ?? externalDocumentationError}
              label={translate(additionalDocumentation.label)}
              description={translate(additionalDocumentation.description ?? '')}
              value={value?.additionalDocumentation ?? ''}
              onChange={handleAdditionalDocumentationChange}
              required={false}
              showOptionalText={false}
              readOnly={readOnly}
              marginBottom={showDeadline && deadline ? 'space-16' : 'space-0'}
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
