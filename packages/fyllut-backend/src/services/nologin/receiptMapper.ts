import { Attachment, SubmitApplicationResponse } from '@navikt/skjemadigitalisering-shared-backend';
import { ReceiptSummary } from '@navikt/skjemadigitalisering-shared-domain';

const mapAttachment = (attachment: Attachment) => ({
  id: attachment.attachmentCode,
  title: attachment.label,
});

const mapToReceiptSummary = (receipt: SubmitApplicationResponse): ReceiptSummary => ({
  title: receipt.title,
  receivedDate: receipt.submittedAt,
  sendLaterDeadline: receipt.subsequentSubmissionDeadline || undefined,
  receivedAttachments: receipt.attachments.filter((a) => a.uploadStatus === 'Innsendt').map(mapAttachment),
  attachmentsToSendLater: receipt.attachments.filter((a) => a.uploadStatus === 'SendSenere').map(mapAttachment),
  attachmentsToBeSentByOthers: receipt.attachments.filter((a) => a.uploadStatus === 'SendesAvAndre').map(mapAttachment),
});

export { mapToReceiptSummary };
