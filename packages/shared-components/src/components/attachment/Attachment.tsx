import { Alert, Textarea } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  AttachmentValue,
  ComponentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, ReactNode } from 'react';
import SingleSelect from '../single-select/SingleSelect';

interface Props {
  title: ReactNode;
  description: ReactNode;
  error: ReactNode;
  value?: any;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  onChange: (value: AttachmentValue) => void;
  translate: (text: string, params?: any) => string;
  deadline?: string;
}

const Attachment = ({ attachmentValues, value, title, description, error, onChange, translate, deadline }: Props) => {
  const additionalDocumentation = attachmentValues?.[value?.key]?.additionalDocumentation;
  const showDeadline = !!attachmentValues?.[value?.key]?.showDeadline;

  const getValues = (): ComponentValue[] => {
    if (attachmentValues) {
      if (Array.isArray(attachmentValues)) {
        return attachmentValues;
      } else if (typeof attachmentValues === 'object') {
        return Object.entries(attachmentValues)
          .map(([key, values]) => {
            if (!values.enabled) {
              return undefined;
            } else {
              return {
                value: key,
                label: translate(TEXTS.statiske.attachment[key]),
              };
            }
          })
          .filter((values) => !!values) as ComponentValue[];
      }
    }

    return [];
  };

  const handleAttachmentChange = (key: string) => {
    onChange({
      ...value,
      key,
      additionalDocumentation: attachmentValues?.[key]?.additionalDocumentation?.enabled
        ? value?.additionalDocumentation
        : undefined,
    });
  };

  const handleAdditionalDocumentationChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...value,
      additionalDocumentation: event.currentTarget.value,
    });
  };

  return (
    <div>
      <SingleSelect
        values={getValues()}
        value={value?.key ?? ''}
        title={title}
        description={description}
        error={error}
        onChange={handleAttachmentChange}
      />
      {additionalDocumentation?.enabled && (
        <Textarea
          className="mb-4"
          label={translate(additionalDocumentation.label)}
          value={value?.additionalDocumentation ?? ''}
          description={translate(additionalDocumentation.description)}
          onChange={handleAdditionalDocumentationChange}
        />
      )}
      {showDeadline && deadline && (
        <Alert variant="warning" inline>
          {translate(TEXTS.statiske.attachment.deadline, { deadline })}
        </Alert>
      )}
    </div>
  );
};

export default Attachment;
