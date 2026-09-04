import { AttachmentField } from './validationTypes';

/**
 * The single path contract for attachment validation.
 *
 * Attachment errors are registered on this path, and every attachment control binds to the same
 * path, so the id derived from it (see `inputId`) lets an error summary link focus the option,
 * title or upload control the error belongs to.
 */
const attachmentValidationPath = (attachmentId: string, field: AttachmentField) =>
  `attachments.${attachmentId}.${field}`;

export { attachmentValidationPath };
