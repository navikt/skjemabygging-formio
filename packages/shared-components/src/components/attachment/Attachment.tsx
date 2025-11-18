import { Alert, Textarea } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, ReactNode } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import SingleSelect from '../single-select/SingleSelect';

interface Props {
  title: ReactNode;
  description: ReactNode;
  value?: any;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  onChange: (value: SubmissionAttachmentValue) => void;
  deadline?: string;
}

const Attachment = ({ attachmentValues, value, title, description, onChange, deadline }: Props) => {
  const { translate, addRef, getComponentError, focusHandler, blurHandler } = useComponentUtils();
  const additionalDocumentation = attachmentValues?.[value?.key]?.additionalDocumentation;
  const showDeadline = !!attachmentValues?.[value?.key]?.showDeadline;

  const additionalDocumentationMaxLength = 200;
  const values = attachmentUtils.mapKeysToOptions(attachmentValues, translate);

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
    const additionalDocumentation = event.currentTarget.value ?? '';
    if (additionalDocumentation.length <= additionalDocumentationMaxLength) {
      onChange({
        ...value,
        additionalDocumentation,
      });
    }
  };

  return (
    <div>
      <SingleSelect
        values={values}
        value={value?.key ?? ''}
        title={title}
        description={description}
        onChange={handleAttachmentChange}
        // onFocus={focusHandler('attachment:value')} //fixme
        // onBlur={blurHandler('attachment:value')} //fixme
        ref={(ref) => addRef('attachment:value', ref)}
        error={getComponentError('attachment:value')}
        className="mb-4"
      />
      {additionalDocumentation?.enabled && (
        <Textarea
          className="mb-4"
          label={translate(additionalDocumentation.label)}
          value={value?.additionalDocumentation ?? ''}
          description={translate(additionalDocumentation.description)}
          onChange={handleAdditionalDocumentationChange}
          onFocus={focusHandler('attachment:additionalDocumentation')}
          onBlur={blurHandler('attachment:additionalDocumentation')}
          ref={(ref) => addRef('attachment:additionalDocumentation', ref)}
          error={getComponentError('attachment:additionalDocumentation')}
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
};

export default Attachment;
