import { Receipt, ReceiptSummary, SubmittedAttachment } from '@navikt/skjemadigitalisering-shared-domain';

const mapAttachment = (attachment: SubmittedAttachment) => ({
  id: attachment.vedleggsnr,
  title: attachment.tittel,
});

const mapReceiptToSummary = (receipt: Receipt): ReceiptSummary => ({
  title: receipt.label,
  receivedDate: receipt.mottattdato,
  sendLaterDeadline: receipt.ettersendingsfrist || undefined,
  receivedAttachments: receipt.innsendteVedlegg.map(mapAttachment),
  attachmentsToSendLater: receipt.skalEttersendes.map(mapAttachment),
  attachmentsToBeSentByOthers: receipt.skalSendesAvAndre.map(mapAttachment),
});

export { mapReceiptToSummary };
