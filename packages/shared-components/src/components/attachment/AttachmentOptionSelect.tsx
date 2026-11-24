import { Alert, BodyShort, Label, Textarea } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  SubmissionMethod,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, forwardRef, ReactNode, useEffect } from 'react';
import SingleSelect from '../single-select/SingleSelect';

interface Props {
  title: ReactNode;
  description: ReactNode;
  error?: ReactNode;
  value?: Partial<SubmissionAttachmentValue>;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  onChange: (value: SubmissionAttachmentValue | undefined) => void;
  translate: (text: string, params?: any) => string;
  deadline?: string;
  className?: string;
  submissionMethod?: SubmissionMethod;
}

const AttachmentOptionSelect = forwardRef<HTMLFieldSetElement, Props>(
  (
    {
      attachmentValues,
      value,
      title,
      description,
      error,
      onChange,
      translate,
      deadline,
      className,
      submissionMethod,
    }: Props,
    ref,
  ) => {
    const additionalDocumentationMaxLength = 200;
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

    const handleAttachmentChange = (key: string | undefined) => {
      if (key) {
        onChange({
          key: key as SubmissionAttachmentValue['key'],
          additionalDocumentation: attachmentValues?.[key]?.additionalDocumentation?.enabled
            ? value?.additionalDocumentation
            : undefined,
        });
      } else {
        onChange(undefined);
      }
    };

    const handleAdditionalDocumentationChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      if (!selectedValueKey) {
        return;
      }

      const additionalDocumentation = event.currentTarget.value ?? '';
      if (additionalDocumentation.length <= additionalDocumentationMaxLength) {
        onChange({
          key: selectedValueKey,
          additionalDocumentation,
        });
      }
    };

    return (
      <div className={className}>
        {implicitValueKey ? (
          <div className="mb-4">
            <Label>{title}</Label>
            <BodyShort>{description}</BodyShort>
          </div>
        ) : (
          <SingleSelect
            values={values}
            value={selectedValueKey ?? ''}
            title={title}
            description={description}
            error={error}
            onChange={handleAttachmentChange}
            ref={ref}
            className="mb-4"
          />
        )}
        {additionalDocumentation?.enabled && (
          <Textarea
            className="mb-4"
            label={translate(additionalDocumentation.label)}
            value={selectedValueKey === value?.key ? (value?.additionalDocumentation ?? '') : ''}
            description={translate(additionalDocumentation.description)}
            onChange={handleAdditionalDocumentationChange}
            maxLength={additionalDocumentationMaxLength}
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
