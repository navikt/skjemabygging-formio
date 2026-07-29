import { Box, Button, ErrorSummary, VStack } from '@navikt/ds-react';
import { TEXTS, checkCondition, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFormPersistence } from '../../context/persistence/PersistenceContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../layout/FormButtonRow';
import type { FormRendererAttachmentAdapter } from '../types';
import AttachmentCancelModal from './AttachmentCancelModal';
import AttachmentField from './AttachmentField';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentValidator } from './attachmentValidation';
import OtherAttachmentField from './OtherAttachmentField';
import { AttachmentComponentConfig } from './types';

const fileUploadErrorParams = { maxFileSize: '150 MB', maxAttachmentSize: '150 MB' };

const AttachmentUploadPage = ({
  onPrevious,
  onNext,
  adapter,
  onCancel,
  exitUrl,
}: {
  onPrevious: () => void;
  onNext: () => void;
  adapter?: FormRendererAttachmentAdapter;
  onCancel?: () => Promise<void>;
  exitUrl?: string;
}) => {
  const { submissionMethod } = useAppConfig();
  const { translate } = useLanguage();
  const { form } = useFormDefinition();
  const { submission, setSubmission } = useSubmissionState();
  const { saveDraft, canSaveDraft, status } = useFormPersistence();
  const { submissionAttachments, errors, addError, removeAllErrors } = useAttachmentUpload();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const refs = useRef<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>({});
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(form, submission);
  const attachments = useMemo<AttachmentComponentConfig[]>(
    () =>
      navFormUtils
        .flattenComponents(attachmentPanel?.components ?? [])
        .filter((component) => component.type === 'attachment')
        .filter((component) => checkCondition(component, undefined, submission?.data, form, undefined, submission))
        .map((component) => ({
          navId: navFormUtils.getNavId(component)!,
          label: component.label,
          description: component.description,
          attachmentValues: component.attachmentValues,
          values: component.values,
          attachmentType: component.attachmentType,
        })),
    [attachmentPanel?.components, form, submission],
  );

  useEffect(() => {
    const visibleIds = new Set(attachments.map((attachment) => attachment.navId));
    setSubmission((current) => {
      const currentAttachments = current?.attachments ?? [];
      const nextAttachments = currentAttachments
        .filter((attachment) => visibleIds.has(attachment.navId))
        .filter(
          (attachment) =>
            attachment.value !== undefined ||
            !!attachment.title?.trim() ||
            !!attachment.additionalDocumentation?.trim() ||
            !!attachment.files?.length,
        );
      return nextAttachments.length === currentAttachments.length &&
        nextAttachments.every((attachment, index) => attachment === currentAttachments[index])
        ? current
        : { ...(current ?? { data: {} }), attachments: nextAttachments };
    });
  }, [attachments, setSubmission]);

  const order = useMemo(
    () => Object.fromEntries(attachments.map((attachment, index) => [attachment.navId, index])),
    [attachments],
  );
  const errorItems = Object.entries(errors)
    .flatMap(([attachmentId, attachmentErrors]) =>
      attachmentErrors.map((error, index) => ({
        attachmentId,
        error,
        key: `${attachmentId}-${error.type}-${index}`,
        order: order[attachmentId.split('-')[0] ?? attachmentId] ?? Number.MAX_SAFE_INTEGER,
      })),
    )
    .sort((first, second) => first.order - second.order);

  const validate = () => {
    removeAllErrors();
    const valueErrors = attachments.flatMap((attachment) => {
      const submissionAttachment = submissionAttachments.find((entry) =>
        entry.attachmentId.startsWith(attachment.navId),
      );
      const error = attachmentValidator(translate, ['value']).validate(attachment.label, submissionAttachment);
      return error ? [[attachment.navId, error] as const] : [];
    });
    const fileErrors = attachments.flatMap((attachment) => {
      const submissionAttachment = submissionAttachments.find((entry) =>
        entry.attachmentId.startsWith(attachment.navId),
      );
      const error = attachmentValidator(translate, ['fileUploaded']).validate(attachment.label, submissionAttachment);
      return error ? [[attachment.navId, error] as const] : [];
    });
    [...valueErrors, ...fileErrors].forEach(([attachmentId, error]) =>
      addError(attachmentId, error, valueErrors.some(([id]) => id === attachmentId) ? 'VALUE' : 'FILE'),
    );
    return valueErrors.length === 0 && fileErrors.length === 0;
  };

  const focusField = (attachmentId: string, type: 'FILE' | 'VALUE' | 'TITLE') => {
    const baseId = attachmentId.split('-')[0] ?? attachmentId;
    const key =
      type === 'TITLE' ? `${attachmentId}-TITLE` : type === 'FILE' ? `${attachmentId}-FILE` : `${baseId}-VALUE`;
    refs.current[key]?.focus();
  };

  return (
    <>
      {errorItems.length > 0 && (
        <ErrorSummary heading={translate(TEXTS.validering.error)} size="small" data-cy="error-summary">
          {errorItems.map(({ attachmentId, error, key }) => (
            <ErrorSummary.Item
              key={key}
              href="#"
              onClick={(event) => {
                event.preventDefault();
                focusField(attachmentId, error.type);
              }}
            >
              {translate(error.message, fileUploadErrorParams)}
            </ErrorSummary.Item>
          ))}
        </ErrorSummary>
      )}
      <VStack gap="space-32">
        {attachments.map((attachment, index) => (
          <Box
            key={attachment.navId}
            borderWidth={index === attachments.length - 1 ? undefined : '0 0 1 0'}
            borderColor="neutral-subtle"
            paddingBlock={index === attachments.length - 1 ? undefined : 'space-0 space-32'}
          >
            {attachment.attachmentType === 'other' ? (
              <OtherAttachmentField attachment={attachment} refs={refs} adapter={adapter} />
            ) : (
              <AttachmentField attachment={attachment} refs={refs} adapter={adapter} />
            )}
          </Box>
        ))}
      </VStack>
      <FormButtonRow
        previousButton={
          <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={onPrevious} />
        }
        nextButton={
          <FormNextButton
            label={translate(
              submissionMethod === 'digital'
                ? TEXTS.grensesnitt.navigation.saveAndContinue
                : TEXTS.grensesnitt.navigation.next,
            )}
            loading={status === 'saving'}
            onClick={() => {
              if (!validate()) {
                return;
              }
              void (async () => {
                if (submissionMethod === 'digital' && canSaveDraft) {
                  await saveDraft();
                }
                onNext();
              })();
            }}
          />
        }
      />
      {submissionMethod === 'digitalnologin' && onCancel && (
        <Box marginBlock="space-0 space-20">
          <Button variant="tertiary" onClick={() => setCancelModalOpen(true)}>
            {translate(TEXTS.grensesnitt.navigation.cancelAndDelete)}
          </Button>
        </Box>
      )}
      <AttachmentCancelModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onCancel={onCancel}
        exitUrl={exitUrl}
      />
    </>
  );
};

export { AttachmentUploadPage };
