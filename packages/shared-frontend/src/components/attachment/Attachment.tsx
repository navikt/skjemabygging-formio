import {
  CheckboxGroup as AkselCheckboxGroup,
  RadioGroup as AkselRadioGroup,
  Alert,
  Checkbox,
  Radio,
} from '@navikt/ds-react';
import {
  AttachmentOption,
  AttachmentSettingValues,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore, { ReadMoreProps } from '../read-more/ReadMore';
import FormElementBox, { Spacing } from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import TextField from '../text-field/TextField';

interface AttachmentProps {
  statePath: string;
  label: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  marginBottom?: Spacing;
  readMore?: ReadMoreProps;
  values: AttachmentOption[];
  attachmentValues?: AttachmentSettingValues;
  deadlineDays?: string;
}

type AttachmentStateValue = SubmissionAttachmentValue & { showDeadline?: boolean };

const Attachment = ({
  statePath,
  label,
  description,
  required = true,
  readOnly,
  marginBottom,
  readMore,
  values,
  attachmentValues,
  deadlineDays,
}: AttachmentProps) => {
  const { translate } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const currentValue = (stateValue ?? {}) as AttachmentStateValue;
  const selectedValue = currentValue?.key;
  const selectedOption = useMemo(
    () => values.find((option) => option.value === selectedValue),
    [selectedValue, values],
  );
  const selectedAttachmentSetting = selectedValue ? attachmentValues?.[selectedValue] : undefined;
  const additionalDocumentation = selectedAttachmentSetting?.additionalDocumentation?.enabled
    ? selectedAttachmentSetting.additionalDocumentation
    : selectedOption?.additionalDocumentation;
  const singleOption = values.length === 1 ? values[0] : undefined;
  const checkedValues = singleOption && selectedValue === singleOption.value ? [singleOption.value] : [];
  const shouldShowDeadline = !!(selectedValue && attachmentValues?.[selectedValue]?.showDeadline && deadlineDays);

  return (
    <FormElementBox marginBottom={marginBottom}>
      {singleOption ? (
        <AkselCheckboxGroup
          id={inputId(statePath)}
          legend={
            <TranslatedLabel required={required} readOnly={readOnly}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          value={checkedValues}
          onChange={(nextValue) =>
            setStateValue(
              nextValue.includes(singleOption.value)
                ? {
                    key: singleOption.value,
                    ...(additionalDocumentation?.label && currentValue.additionalDocumentation
                      ? { additionalDocumentation: currentValue.additionalDocumentation }
                      : {}),
                  }
                : undefined,
            )
          }
          error={error}
          readOnly={readOnly}
        >
          <Checkbox value={singleOption.value}>{singleOption.label}</Checkbox>
        </AkselCheckboxGroup>
      ) : (
        <AkselRadioGroup
          id={inputId(statePath)}
          tabIndex={-1}
          legend={
            <TranslatedLabel required={required} readOnly={readOnly}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          value={selectedValue ?? ''}
          onChange={(nextValue) =>
            setStateValue({
              key: nextValue,
              ...(attachmentValues?.[nextValue]?.additionalDocumentation?.enabled &&
              currentValue.additionalDocumentation
                ? { additionalDocumentation: currentValue.additionalDocumentation }
                : {}),
            })
          }
          error={error}
          readOnly={readOnly}
        >
          {values.map(({ value, label: optionLabel }) => (
            <Radio key={value} value={value}>
              {optionLabel}
            </Radio>
          ))}
        </AkselRadioGroup>
      )}

      {additionalDocumentation?.label && (
        <TextField
          statePath={`${statePath}.additionalDocumentation`}
          label={additionalDocumentation.label}
          description={additionalDocumentation.description}
          required={false}
          showOptionalText={false}
          readOnly={readOnly}
          marginBottom="space-16"
        />
      )}

      {shouldShowDeadline && (
        <Alert variant="warning" inline>
          {translate(TEXTS.statiske.attachment.deadline, { deadline: deadlineDays })}
        </Alert>
      )}

      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Attachment;
export type { AttachmentProps };
