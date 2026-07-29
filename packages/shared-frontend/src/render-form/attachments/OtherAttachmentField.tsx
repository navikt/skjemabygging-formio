import { PlusIcon } from '@navikt/aksel-icons';
import { Button, Label, VStack } from '@navikt/ds-react';
import {
  SubmissionAttachment,
  SubmissionAttachmentValue,
  TEXTS,
  attachmentUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import type { FormRendererAttachmentAdapter } from '../types';
import AttachmentOptions from './AttachmentOptions';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentFromId } from './attachmentValidation';
import FileUploader from './FileUploader';
import { AttachmentComponentConfig, AttachmentRefs, setRef } from './types';

const OtherAttachmentField = ({
  attachment,
  refs,
  adapter,
}: {
  attachment: AttachmentComponentConfig;
  refs: AttachmentRefs;
  adapter?: FormRendererAttachmentAdapter;
}) => {
  const { submissionMethod } = useAppConfig();
  const { form } = useFormDefinition();
  const { translate } = useLanguage();
  const { submissionAttachments, errors, changeAttachmentValue, handleDeleteAttachment } = useAttachmentUpload();
  const submissionAttachment = submissionAttachments.find((entry) => entry.attachmentId.startsWith(attachment.navId));
  const [attachments, setAttachments] = useState<SubmissionAttachment[]>(
    submissionAttachment
      ? submissionAttachments.filter((entry) => entry.attachmentId.startsWith(attachment.navId))
      : [attachmentFromId(attachment.navId)],
  );
  const [counter, setCounter] = useState(() =>
    Math.max(0, ...attachments.map((entry) => parseInt(entry.attachmentId.split('-')[1] ?? '0', 10))),
  );
  const values = attachment.attachmentValues ?? attachment.values;
  const options = attachmentUtils.mapKeysToOptions(values, translate, submissionMethod);
  const uploadSelected =
    attachmentUtils.isSingleUploadOnlyOption(values, submissionMethod) ||
    !!options.find((option) => option.value === submissionAttachment?.value)?.upload;
  const error = errors[attachment.navId]?.find((entry) => entry.type === 'VALUE');

  const change = (value?: Partial<SubmissionAttachmentValue>) =>
    changeAttachmentValue(
      submissionAttachment ?? attachmentFromId(attachment.navId),
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
    );

  const deleteAttachment = async (attachmentId: string) => {
    try {
      if (submissionAttachments.find((entry) => entry.attachmentId === attachmentId)?.files?.length) {
        await handleDeleteAttachment(attachmentId);
      }
      setAttachments((current) =>
        current.length === 1
          ? [attachmentFromId(attachment.navId, current[0]?.value)]
          : current.filter((entry) => entry.attachmentId !== attachmentId),
      );
    } catch {
      // The upload provider exposes the user-facing error.
    }
  };

  const description = attachment.description && (
    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(attachment.description)) }} />
  );

  return (
    <VStack gap="space-24" data-cy="attachment-upload">
      {submissionAttachment?.files?.length ? (
        <div>
          <Label>{translate(attachment.label)}</Label>
          {description}
        </div>
      ) : (
        <AttachmentOptions
          title={translate(attachment.label)}
          description={description}
          error={error?.message}
          value={submissionAttachment?.value ? { key: submissionAttachment.value } : undefined}
          attachmentValues={values}
          onChange={change}
          deadline={form.properties.ettersendelsesfrist}
          ref={(ref) => setRef(refs, `${attachment.navId}-VALUE`, ref)}
        />
      )}
      {uploadSelected && (
        <VStack gap="space-16">
          {submissionAttachment?.files?.length ? (
            <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
          ) : null}
          {attachments.map((entry) => (
            <FileUploader
              key={entry.attachmentId}
              attachment={entry}
              attachmentValue={submissionAttachment?.value}
              requireAttachmentTitle
              showDeleteAttachmentButton={attachments.length > 1}
              onDeleteAttachment={deleteAttachment}
              refs={refs}
              adapter={adapter}
            />
          ))}
          {attachments.every(
            (entry) =>
              submissionAttachments.find((current) => current.attachmentId === entry.attachmentId)?.files?.length,
          ) && (
            <Button
              variant="tertiary"
              icon={<PlusIcon aria-hidden fontSize="1.5rem" />}
              onClick={() => {
                setAttachments((current) => [
                  ...current,
                  { attachmentId: `${attachment.navId}-${counter + 1}`, navId: attachment.navId, type: 'other' },
                ]);
                setCounter((current) => current + 1);
              }}
            >
              {translate(TEXTS.statiske.attachment.addNewAttachment)}
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default OtherAttachmentField;
