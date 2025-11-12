export interface Receipt {
  innsendingsId: string;
  label: string;
  mottattdato: string;
  hoveddokumentRef?: string;
  innsendteVedlegg: SubmittedAttachment[];
  skalEttersendes: SubmittedAttachment[];
  levertTidligere: SubmittedAttachment[];
  sendesIkkeInn: SubmittedAttachment[];
  skalSendesAvAndre: SubmittedAttachment[];
  navKanInnhente: SubmittedAttachment[];
  ettersendingsfrist: string;
}

export interface SubmittedAttachment {
  vedleggsnr: string;
  tittel: string;
  url: string;
  opplastingsValgKommentarLedetekst: string;
  opplastingsValgKommentar: string;
}

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
