import { Alert, Textarea } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  AttachmentValue,
  ComponentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useState } from 'react';
import SingleSelect from '../single-select/SingleSelect';

interface Props {
  title: ReactNode;
  description: ReactNode;
  error: ReactNode;
  value?: any;
  values?: ComponentValue[];
  attachmentValues?: AttachmentSettingValues;
  onChange: (value: AttachmentValue) => void;
  translate: (text: string) => string;
}

const Attachment = ({
  attachmentValues,
  values = [],
  value,
  title,
  description,
  error,
  onChange,
  translate,
}: Props) => {
  const [showDeadline, setShowDeadline] = useState<boolean>(false);
  const [additionalDocumentation, setAdditionalDocumentation] = useState<any>('');

  const getValues = () => {
    if (attachmentValues) {
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

    return values;
  };

  const handleAttachmentChange = (key) => {
    updateState(key);
    onChange({
      ...value,
      key,
      description: TEXTS.statiske.attachment[key],
      deadlineWarning: TEXTS.statiske.attachment.deadline,
    });
  };

  const handleAdditionalDocumentationChange = (event) => {
    onChange({
      ...value,
      additionalDocumentation: event.currentTarget.value,
    });
  };

  const updateState = (key: string) => {
    setShowDeadline(!!attachmentValues?.[key]?.showDeadline);
    setAdditionalDocumentation(
      attachmentValues?.[key]?.additionalDocumentation.enabled
        ? attachmentValues?.[key]?.additionalDocumentation
        : undefined,
    );
  };

  useEffect(() => {
    updateState(value?.key);
  }, [value]);

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
      {additionalDocumentation && (
        <Textarea
          className="mb-4"
          label={translate(additionalDocumentation.label)}
          value={value?.additionalDocumentation ?? ''}
          description={translate(additionalDocumentation.description)}
          onChange={handleAdditionalDocumentationChange}
        />
      )}
      {showDeadline && (
        <Alert variant="warning" inline>
          {translate(TEXTS.statiske.attachment.deadline)}
        </Alert>
      )}
    </div>
  );
};

export default Attachment;
