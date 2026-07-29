import { Button, Label, VStack } from '@navikt/ds-react';
import { SubmissionAttachmentValue, TEXTS, attachmentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import type { FormRendererAttachmentAdapter } from '../types';
import AttachmentOptions from './AttachmentOptions';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentValidator } from './attachmentValidation';
import FileUploader from './FileUploader';
import { AttachmentComponentConfig, AttachmentRefs, setRef } from './types';

const AttachmentField = ({
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
  const { submissionAttachments, errors, changeAttachmentValue, handleDeleteAllFilesForAttachment } =
    useAttachmentUpload();
  const submissionAttachment = submissionAttachments.find((entry) => entry.attachmentId.startsWith(attachment.navId));
  const values = attachment.attachmentValues ?? attachment.values;
  const options = attachmentUtils.mapKeysToOptions(values, translate, submissionMethod);
  const uploadSelected =
    attachmentUtils.isSingleUploadOnlyOption(values, submissionMethod) ||
    !!options.find((option) => option.value === submissionAttachment?.value)?.upload;
  const error = errors[attachment.navId]?.find((entry) => entry.type === 'VALUE');

  const change = (value?: Partial<SubmissionAttachmentValue>) =>
    changeAttachmentValue(
      submissionAttachment ?? {
        attachmentId: attachment.navId,
        navId: attachment.navId,
        type: attachment.attachmentType ?? 'default',
      },
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
      attachmentValidator(translate, ['value']),
    );

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
          value={
            submissionAttachment?.value
              ? {
                  key: submissionAttachment.value,
                  additionalDocumentation: submissionAttachment.additionalDocumentation,
                }
              : undefined
          }
          attachmentValues={values}
          onChange={change}
          deadline={form.properties.ettersendelsesfrist}
          ref={(ref) => setRef(refs, `${attachment.navId}-VALUE`, ref)}
        />
      )}
      {uploadSelected && (
        <VStack gap="space-8">
          {submissionAttachment?.files?.length ? (
            <div>
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
              {submissionAttachment.files.length > 1 && (
                <Button variant="tertiary" onClick={() => void handleDeleteAllFilesForAttachment(attachment.navId)}>
                  {translate(TEXTS.statiske.attachment.deleteAllFiles)}
                </Button>
              )}
            </div>
          ) : null}
          <FileUploader
            attachment={{
              attachmentId: attachment.navId,
              navId: attachment.navId,
              type: attachment.attachmentType ?? 'default',
            }}
            multiple
            refs={refs}
            adapter={adapter}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentField;
