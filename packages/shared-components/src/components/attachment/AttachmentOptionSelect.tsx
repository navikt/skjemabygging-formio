import { Alert, Textarea } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, forwardRef, ReactNode } from 'react';
import SingleSelect from '../single-select/SingleSelect';

interface Props {
  title: ReactNode;
  description: ReactNode;
  error?: ReactNode;
  value?: any;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  onChange: (value: SubmissionAttachmentValue | undefined) => void;
  translate: (text: string, params?: any) => string;
  deadline?: string;
  className?: string;
}

const AttachmentOptionSelect = forwardRef<HTMLFieldSetElement, Props>(
  ({ attachmentValues, value, title, description, error, onChange, translate, deadline, className }: Props, ref) => {
    const additionalDocumentation = attachmentValues?.[value?.key]?.additionalDocumentation;
    const showDeadline = !!attachmentValues?.[value?.key]?.showDeadline;

    const additionalDocumentationMaxLength = 200;
    const values = attachmentUtils.mapKeysToOptions(attachmentValues, translate);

    const handleAttachmentChange = (key: string | undefined) => {
      if (key) {
        onChange({
          ...value,
          key,
          additionalDocumentation: attachmentValues?.[key]?.additionalDocumentation?.enabled
            ? value?.additionalDocumentation
            : undefined,
        });
      } else {
        onChange(undefined);
      }
    };

    const handleAdditionalDocumentationChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const additionalDocumentation = event.currentTarget.value ?? '';
      if (additionalDocumentation.length <= additionalDocumentationMaxLength) {
        onChange({
          ...value,
          additionalDocumentation,
        });
      }
    };

    return (
      <div className={className}>
        <SingleSelect
          values={values}
          value={value?.key ?? ''}
          title={title}
          description={description}
          error={error}
          onChange={handleAttachmentChange}
          ref={ref}
          className="mb-4"
        />
        {additionalDocumentation?.enabled && (
          <Textarea
            className="mb-4"
            label={translate(additionalDocumentation.label)}
            value={value?.additionalDocumentation ?? ''}
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
