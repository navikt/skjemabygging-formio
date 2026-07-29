import { BodyShort, InlineMessage, Label, Radio, RadioGroup, Textarea, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  ComponentValue,
  SubmissionAttachmentValue,
  TEXTS,
  attachmentUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, forwardRef, useEffect } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useLanguage } from '../../context/language/LanguageContext';

const RichDescription = ({ content }: { content?: ReactNode }) =>
  content ? <BodyShort as="div">{content}</BodyShort> : null;

const AttachmentOptions = forwardRef<
  HTMLFieldSetElement,
  {
    title: string;
    description?: ReactNode;
    error?: string;
    value?: Partial<SubmissionAttachmentValue>;
    attachmentValues?: AttachmentSettingValues | ComponentValue[];
    onChange: (value: SubmissionAttachmentValue | undefined) => void;
    deadline?: string;
  }
>(({ attachmentValues, value, title, description, error, onChange, deadline }, ref) => {
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const values = attachmentUtils.mapKeysToOptions(attachmentValues, translate, submissionMethod);
  const implicitValueKey = attachmentUtils.getImplicitValueKey(attachmentValues, submissionMethod);
  const selectedValueKey = value?.key ?? implicitValueKey;
  const additionalDocumentation = selectedValueKey
    ? attachmentValues?.[selectedValueKey]?.additionalDocumentation
    : undefined;
  const showDeadline = selectedValueKey ? !!attachmentValues?.[selectedValueKey]?.showDeadline : false;

  useEffect(() => {
    if (implicitValueKey && value?.key !== implicitValueKey) {
      onChange({
        key: implicitValueKey,
        additionalDocumentation: attachmentValues?.[implicitValueKey]?.additionalDocumentation?.enabled
          ? value?.additionalDocumentation
          : undefined,
      });
    }
  }, [attachmentValues, implicitValueKey, onChange, value?.additionalDocumentation, value?.key]);

  return (
    <VStack gap="space-16">
      {implicitValueKey ? (
        <div>
          <Label>{title}</Label>
          <RichDescription content={description} />
        </div>
      ) : (
        <RadioGroup
          legend={title}
          description={description}
          error={error}
          value={selectedValueKey ?? ''}
          onChange={(key) => {
            onChange({
              key: key as SubmissionAttachmentValue['key'],
              additionalDocumentation: attachmentValues?.[key]?.additionalDocumentation?.enabled
                ? value?.additionalDocumentation
                : undefined,
            });
          }}
          ref={ref}
        >
          {values.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      )}
      {additionalDocumentation?.enabled && (
        <Textarea
          label={translate(additionalDocumentation.label)}
          value={selectedValueKey === value?.key ? (value?.additionalDocumentation ?? '') : ''}
          description={translate(additionalDocumentation.description)}
          maxLength={200}
          onChange={(event) =>
            onChange({
              key: selectedValueKey!,
              additionalDocumentation: event.currentTarget.value,
            })
          }
        />
      )}
      {showDeadline && deadline && (
        <InlineMessage status="warning">{translate(TEXTS.statiske.attachment.deadline, { deadline })}</InlineMessage>
      )}
    </VStack>
  );
});

export default AttachmentOptions;
