export interface ReceiptSummaryAttachment {
  id: string;
  title: string;
}

export interface ReceiptSummary {
  title: string;
  receivedDate: string;
  sendLaterDeadline?: string;
  receivedAttachments: ReceiptSummaryAttachment[];
  attachmentsToSendLater: ReceiptSummaryAttachment[];
  attachmentsToBeSentByOthers: ReceiptSummaryAttachment[];
}
