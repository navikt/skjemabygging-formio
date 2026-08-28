import {
  Component,
  navFormUtils,
  Submission,
  SubmissionMethod,
  submissionUtils,
  TEXTS,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import { deriveValidations } from '../../validation/deriveValidations';
import { validateValue } from '../../validation/validators';
import { getAttachmentsAtPath } from '../attachment/attachmentData';
import { AttachmentField, ExternalAttachmentError, FieldError } from './validationTypes';

interface RuleViolation {
  textKey: string;
  params: Record<string, string | number>;
}

type AttachmentViolation = { submissionPath: string; violation: RuleViolation };

const attachmentValidationPath = (attachmentId: string, field: AttachmentField) =>
  `attachments.${attachmentId}.${field}`;

const validateAttachmentComponent = (
  component: Component,
  submissionPath: string,
  field: string,
  activeSubmission: Submission | undefined,
  submissionMethod?: string,
): AttachmentViolation[] => {
  if (submissionMethod === 'paper' || submissionMethod === 'papernocoverpage' || submissionMethod === undefined) {
    return [];
  }

  const attachmentId = navFormUtils.getNavId(component);
  if (!attachmentId) {
    return [];
  }

  const attachments = getAttachmentsAtPath(activeSubmission, submissionPath).filter(
    (attachment) => attachment.navId === attachmentId,
  );
  const primaryAttachment = attachments[0];
  const violations: AttachmentViolation[] = [];

  if (component.validate?.required && !primaryAttachment?.value) {
    violations.push({
      submissionPath: attachmentValidationPath(attachmentId, 'value'),
      violation: { textKey: TEXTS.validering.required, params: { field } },
    });
  }

  attachments
    .filter((attachment) => attachment.value === 'leggerVedNaa')
    .forEach((attachment) => {
      if ((attachment.files ?? []).length === 0) {
        violations.push({
          submissionPath: attachmentValidationPath(attachment.attachmentId, 'files'),
          violation: { textKey: TEXTS.validering.fileMissing, params: { field } },
        });
      }
    });

  return violations;
};

interface PageErrorCalculatorOptions {
  allowTestTypes: boolean;
  currentLanguage: string;
  externalAttachmentErrors: Record<string, ExternalAttachmentError>;
  submissionMethod?: SubmissionMethod;
  translate: TranslateFunction;
}

const translateViolation = (translate: TranslateFunction, violation: RuleViolation) =>
  translate(violation.textKey, {
    ...violation.params,
    ...(typeof violation.params.field === 'string' && { field: translate(violation.params.field) }),
  });

const createPageErrorCalculator =
  ({
    allowTestTypes,
    currentLanguage,
    externalAttachmentErrors,
    submissionMethod,
    translate,
  }: PageErrorCalculatorOptions) =>
  (pageKey: string, components: Component[], activeSubmission: Submission | undefined): FieldError[] => {
    const derivedErrors = deriveValidations(components, activeSubmission, submissionMethod).flatMap(
      ({ submissionPath, field, rules, component }) => {
        if (
          component?.type === 'attachment' &&
          (submissionMethod === 'digital' || submissionMethod === 'digitalnologin')
        ) {
          return validateAttachmentComponent(component, submissionPath, field, activeSubmission, submissionMethod).map(
            ({ submissionPath: attachmentSubmissionPath, violation }) => ({
              pageKey,
              submissionPath: attachmentSubmissionPath,
              field,
              message: translateViolation(translate, violation),
            }),
          );
        }

        const violation = validateValue(
          submissionUtils.getSubmissionValue(submissionPath, activeSubmission),
          field,
          rules,
          currentLanguage,
          {
            allowTestTypes,
            submission: activeSubmission,
            submissionPath,
          },
        );

        return violation ? [{ pageKey, submissionPath, field, message: translateViolation(translate, violation) }] : [];
      },
    );
    const attachmentIds = new Set(
      navFormUtils
        .flattenComponents(components)
        .filter((component) => component.type === 'attachment')
        .map((component) => navFormUtils.getNavId(component))
        .filter((attachmentId): attachmentId is string => !!attachmentId),
    );
    const uploadErrors = Object.values(externalAttachmentErrors)
      .filter((error) =>
        [...attachmentIds].some(
          (attachmentId) => error.attachmentId === attachmentId || error.attachmentId.startsWith(`${attachmentId}-`),
        ),
      )
      .map(({ attachmentId, field, message }) => ({
        pageKey,
        submissionPath: attachmentValidationPath(attachmentId, field),
        field: '',
        message,
      }));

    return [...derivedErrors, ...uploadErrors];
  };

export { attachmentValidationPath, createPageErrorCalculator };
