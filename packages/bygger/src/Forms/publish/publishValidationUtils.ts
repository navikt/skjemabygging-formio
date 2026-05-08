import { Form, navFormUtils, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';

const ATTACHMENTS_ERROR_MESSAGE =
  'Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.';

const validateAttachments = (form: Form) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter(navFormUtils.isAttachment)
    .every((component) => component.properties?.vedleggskode && component.properties?.vedleggstittel);

const getPaperNoCoverPageErrorMessage = (form: Form) => {
  if (!submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes)) {
    return undefined;
  }

  const missingFields = [
    !(form.properties.innsendingOverskrift ?? '').trim() && '«Overskrift til innsending»',
    !(form.properties.innsendingForklaring ?? '').trim() && '«Forklaring til innsending»',
  ].filter((field): field is string => Boolean(field));

  if (missingFields.length === 0) {
    return undefined;
  }

  const formattedMissingFields =
    missingFields.length === 1
      ? missingFields[0]
      : `${missingFields.slice(0, -1).join(', ')} og ${missingFields.at(-1)}`;

  return `Du må fylle ut ${formattedMissingFields} under skjemainnstillinger før skjemaet kan publiseres.`;
};

const getPublishValidationMessage = (form: Form) => {
  const validationMessages = [
    !validateAttachments(form) && ATTACHMENTS_ERROR_MESSAGE,
    getPaperNoCoverPageErrorMessage(form),
  ].filter((message): message is string => Boolean(message));

  return validationMessages.length > 0 ? validationMessages.join(' ') : undefined;
};

export { ATTACHMENTS_ERROR_MESSAGE, getPaperNoCoverPageErrorMessage, getPublishValidationMessage, validateAttachments };
