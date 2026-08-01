import { Box, ErrorSummary, VStack } from '@navikt/ds-react';
import {
  AttachmentType,
  checkCondition,
  Component,
  navFormUtils,
  Panel,
  SubmissionAttachment,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import {
  FormButtonRow,
  FormNextButton,
  FormPrevButton,
  useFormDefinition,
  useFormPersistence,
  useSubmissionState,
} from '../framework';
import AttachmentCancelButton from './AttachmentCancelButton';
import { AttachmentErrorType, useAttachmentUpload } from './AttachmentUploadContext';
import SharedAttachmentUploadField from './AttachmentUploadField';
import { attachmentValidator } from './attachmentValidation';
import { fileUploadErrorParams } from './fileUploadConfig';
import SharedOtherAttachmentUploadField from './OtherAttachmentUploadField';

interface AttachmentComponentConfig {
  navId: string;
  label: string;
  description?: string;
  attachmentValues?: Component['attachmentValues'];
  values?: Component['values'];
  attachmentType?: AttachmentType;
}

interface Props {
  attachmentPanel: Panel;
  onPrevious: () => void;
  onNext: () => void;
}

const AttachmentUploadPage = ({ attachmentPanel, onPrevious, onNext }: Props) => {
  const { submissionMethod } = useFyllutAppConfig();
  const { translate } = useFyllutLanguage();
  const { form } = useFormDefinition();
  const { submission, setSubmission } = useSubmissionState();
  const { saveDraft, canSaveDraft, status } = useFormPersistence();
  const { submissionAttachments, errors, addError, removeAllErrors } = useAttachmentUpload();
  const refs = useRef<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>({});

  const attachments = useMemo<AttachmentComponentConfig[]>(
    () =>
      navFormUtils
        .flattenComponents(attachmentPanel.components ?? [])
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
    [attachmentPanel.components, form, submission],
  );

  const attachmentOrder = useMemo(
    () =>
      attachments.reduce<Record<string, number>>(
        (acc, attachment, index) => ({ ...acc, [attachment.navId]: index }),
        {},
      ),
    [attachments],
  );

  useEffect(() => {
    const visibleAttachmentIds = new Set(attachments.map((attachment) => attachment.navId));
    const hasAttachmentContent = (attachment: SubmissionAttachment) =>
      attachment.value !== undefined ||
      !!attachment.title?.trim() ||
      !!attachment.additionalDocumentation?.trim() ||
      (attachment.files?.length ?? 0) > 0;

    setSubmission((current) => {
      const currentAttachments = current?.attachments ?? [];
      if (currentAttachments.length === 0) {
        return current;
      }

      const nextAttachments = currentAttachments
        .filter((attachment) => attachment.attachmentId === 'personal-id' || visibleAttachmentIds.has(attachment.navId))
        .filter(hasAttachmentContent)
        .filter(
          (attachment, index, list) =>
            index === list.findIndex((candidate) => candidate.attachmentId === attachment.attachmentId),
        );

      const unchanged =
        nextAttachments.length === currentAttachments.length &&
        nextAttachments.every((attachment, index) => attachment === currentAttachments[index]);

      return unchanged ? current : { ...(current ?? { data: {} }), attachments: nextAttachments };
    });
  }, [attachments, setSubmission]);

  const errorItems = useMemo(() => {
    const items = Object.entries(errors).flatMap(([attachmentId, attachmentErrors]) =>
      attachmentErrors.map((error, index) => ({
        attachmentId,
        key: `${attachmentId}-${error.type}-${index}`,
        type: error.type,
        message: translate(error.message, fileUploadErrorParams),
        order: attachmentOrder[attachmentId.split('-')[0] ?? attachmentId] ?? Number.MAX_SAFE_INTEGER,
      })),
    );
    items.sort((a, b) => a.order - b.order);
    return items;
  }, [attachmentOrder, errors, translate]);

  const focusField = (attachmentId: string, type: AttachmentErrorType) => {
    const topLevelAttachmentId = attachmentId.split('-')[0] ?? attachmentId;
    const refKey =
      type === 'TITLE'
        ? `${attachmentId}-TITLE`
        : type === 'FILE'
          ? `${attachmentId}-FILE`
          : `${topLevelAttachmentId}-VALUE`;
    refs.current[refKey]?.focus();
  };

  const validate = () => {
    removeAllErrors();

    const valueErrors = attachments.reduce<Record<string, string>>((acc, attachment) => {
      const submissionAttachment = submissionAttachments.find((currentAttachment) =>
        currentAttachment.attachmentId.startsWith(attachment.navId),
      );
      const error = attachmentValidator(translate, ['value']).validate(attachment.label, submissionAttachment);
      return error ? { ...acc, [attachment.navId]: error } : acc;
    }, {});
    Object.entries(valueErrors).forEach(([attachmentId, message]) => addError(attachmentId, message, 'VALUE'));

    const fileErrors = attachments.reduce<Record<string, string>>((acc, attachment) => {
      const submissionAttachment = submissionAttachments.find((currentAttachment) =>
        currentAttachment.attachmentId.startsWith(attachment.navId),
      );
      const error = attachmentValidator(translate, ['fileUploaded']).validate(attachment.label, submissionAttachment);
      return error ? { ...acc, [attachment.navId]: error } : acc;
    }, {});
    Object.entries(fileErrors).forEach(([attachmentId, message]) => addError(attachmentId, message, 'FILE'));

    return Object.keys(valueErrors).length === 0 && Object.keys(fileErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) {
      return;
    }

    if (submissionMethod === 'digital' && canSaveDraft) {
      await saveDraft();
    }

    onNext();
  };

  return (
    <>
      {errorItems.length > 0 && (
        <ErrorSummary heading={translate(TEXTS.validering.error)} size="small" data-cy="error-summary">
          {errorItems.map((errorItem) => (
            <ErrorSummary.Item
              key={errorItem.key}
              href="#"
              onClick={(event) => {
                event.preventDefault();
                focusField(errorItem.attachmentId, errorItem.type);
              }}
            >
              {errorItem.message}
            </ErrorSummary.Item>
          ))}
        </ErrorSummary>
      )}
      <VStack gap="space-32">
        {attachments.map((attachment, index) => {
          const description = attachment.description
            ? translate(attachment.description)
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]*>/g, '')
                .trim()
            : undefined;
          const fieldProps = {
            label: translate(attachment.label),
            description,
            attachmentValues: attachment.attachmentValues ?? attachment.values,
            componentId: attachment.navId,
            refs: refs as MutableRefObject<
              Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>
            >,
          };

          return (
            <div
              key={attachment.navId}
              style={
                index === attachments.length - 1
                  ? undefined
                  : {
                      borderBottom: '1px solid var(--ax-border-neutral-subtle)',
                      paddingBottom: 'var(--ax-space-32)',
                    }
              }
            >
              {attachment.attachmentType === 'other' ? (
                <SharedOtherAttachmentUploadField {...fieldProps} />
              ) : (
                <SharedAttachmentUploadField {...fieldProps} type={attachment.attachmentType} />
              )}
            </div>
          );
        })}
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
            onClick={() => {
              void handleNext();
            }}
            loading={status === 'saving'}
          />
        }
      />
      <Box marginBlock="space-0 space-20">
        <AttachmentCancelButton />
      </Box>
    </>
  );
};

export default AttachmentUploadPage;
