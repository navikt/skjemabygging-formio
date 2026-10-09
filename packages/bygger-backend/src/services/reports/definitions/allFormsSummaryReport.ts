import {
  DeclarationType,
  Form,
  navFormUtils,
  Recipient,
  ResponseError,
  signatureUtils,
  submissionTypesUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import config from '../../../config';
import { awaitReportCall, CsvReport } from '../csvPipeline';
import { formatSubmissionTypes, isNotTestForm, ReportDependencies } from '../types';

type SummaryRow = {
  formNumber: string;
  formTitle: string;
  topic: string;
  publishedAt?: string;
  publishedBy?: string;
  unpublishedChanges: string;
  changedAt?: string;
  changedBy?: string;
  submissionTypes: string;
  subsequentSubmissionTypes: string;
  signatureCount: number;
  signerLabels: string;
  path: string;
  attachmentCount: number;
  attachmentNames: string;
  submissionUrl: string;
  paperSubmissionUrl: string;
  paperNoCoverPageSubmissionUrl: string;
  digitalSubmissionUrl: string;
  staticPdfSubmissionUrl: string;
  subsequentSubmissionUrl: string;
  digitalSubsequentSubmissionUrl: string;
  paperSubsequentSubmissionUrl: string;
  staticPdfSubsequentSubmissionUrl: string;
  declarationType: string;
  customDeclarationText: string;
  subsequentSubmissionDeadline?: string;
  recipientAddress: string;
  requiresPaperUnit: string;
  hasGeneralInstructions: string;
  introPageEnabled: string;
  noLoginSubmissionUrl: string;
  hasUploadedPdfs: string;
  staticPdfEnabled: string;
};

const declarationLabels: Record<DeclarationType, string> = {
  [DeclarationType.none]: '',
  [DeclarationType.default]: 'Standard',
  [DeclarationType.custom]: 'Tilpasset',
};

const recipientAddress = (recipientId: string | undefined, recipients: Map<string | undefined, Recipient>) => {
  if (!recipientId) return '';
  const recipient = recipients.get(recipientId);
  if (!recipient) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'Report recipient lookup failed');
  }
  return `${recipient.name}, ${recipient.poBoxAddress}, ${recipient.postalCode} ${recipient.postalName}`;
};

const allFormsSummaryReport = ({
  formsService,
  recipientService,
  staticPdfService,
}: ReportDependencies): CsvReport<SummaryRow> => ({
  columns: {
    formNumber: 'skjemanummer',
    formTitle: 'skjematittel',
    topic: 'tema',
    publishedAt: 'sist publisert',
    publishedBy: 'publisert av',
    unpublishedChanges: 'upubliserte endringer',
    changedAt: 'sist endret',
    changedBy: 'endret av',
    submissionTypes: 'submissionTypes',
    subsequentSubmissionTypes: 'subsequentSubmissionTypes',
    signatureCount: 'signaturfelt',
    signerLabels: 'hvem signerer, hvis ikke standard',
    path: 'path',
    attachmentCount: 'antall vedlegg',
    attachmentNames: 'vedleggsnavn',
    declarationType: 'erklæringstype',
    customDeclarationText: 'tilpasset erklæringstekst',
    subsequentSubmissionDeadline: 'ettersendelsesfrist',
    recipientAddress: 'mottaksadresse',
    requiresPaperUnit: 'må velge enhet (papir)',
    hasGeneralInstructions: 'generelle instruksjoner',
    introPageEnabled: 'introside aktivert',
    hasUploadedPdfs: 'har opplastede PDF-er',
    staticPdfEnabled: 'STATIC_PDF aktivert',
    submissionUrl: 'innsendingsurl',
    paperSubmissionUrl: 'innsendingsurl (papir)',
    digitalSubmissionUrl: 'innsendingsurl (digital)',
    noLoginSubmissionUrl: 'innsendingsurl (nologin)',
    staticPdfSubmissionUrl: 'innsendingsurl (static PDF)',
    paperNoCoverPageSubmissionUrl: 'utfyllingsurl (uten førsteside)',
    subsequentSubmissionUrl: 'ettersendingsurl',
    digitalSubsequentSubmissionUrl: 'ettersendingsurl (digital)',
    paperSubsequentSubmissionUrl: 'ettersendingsurl (papir)',
    staticPdfSubsequentSubmissionUrl: 'ettersendingsurl (static PDF)',
  },
  rows: async function* (signal) {
    signal.throwIfAborted();
    const forms = await awaitReportCall(signal, () =>
      formsService.getAll<
        Pick<
          Form,
          'title' | 'path' | 'properties' | 'status' | 'changedAt' | 'changedBy' | 'publishedAt' | 'publishedBy'
        >
      >('title,path,properties,status,changedAt,changedBy,publishedAt,publishedBy'),
    );
    signal.throwIfAborted();
    const recipients = new Map(
      (await awaitReportCall(signal, () => recipientService.getAll())).map((recipient) => [
        recipient.recipientId,
        recipient,
      ]),
    );
    signal.throwIfAborted();
    for (const compact of forms.filter(isNotTestForm)) {
      signal.throwIfAborted();
      const form = await awaitReportCall(signal, () => formsService.get(compact.path));
      signal.throwIfAborted();
      const pdfs = await awaitReportCall(signal, () => staticPdfService.getAll({ formPath: compact.path }));
      signal.throwIfAborted();
      const attachments = navFormUtils.getAttachmentProperties(form);
      const hasAttachments = attachments.length > 0;
      const { title, path, properties, status, changedAt, changedBy, publishedAt, publishedBy } = compact;
      const { submissionTypes = [], subsequentSubmissionTypes = [], declarationType } = properties;
      const signatures = signatureUtils.mapBackwardCompatibleSignatures(properties.signatures);
      const hasStaticPdfSubsequentSubmission = submissionTypesUtils.isStaticPdf(submissionTypes) && hasAttachments;
      const reportSubsequentSubmissionTypes =
        hasStaticPdfSubsequentSubmission && !subsequentSubmissionTypes.includes('STATIC_PDF')
          ? [...subsequentSubmissionTypes, 'STATIC_PDF' as const]
          : subsequentSubmissionTypes;
      const submissionUrl =
        config.naisClusterName === 'prod-gcp'
          ? `https://www.nav.no/fyllut/${form.path}`
          : `https://fyllut-preprod.intern.dev.nav.no/fyllut/${form.path}`;
      const subsequentSubmissionUrl =
        config.naisClusterName === 'prod-gcp'
          ? `https://www.nav.no/fyllut-ettersending/${form.path}`
          : `https://fyllut-ettersending.intern.dev.nav.no/fyllut-ettersending/${form.path}`;
      const isPublished = status === 'published' || status === 'pending';
      yield {
        formNumber: properties.skjemanummer,
        formTitle: title,
        topic: properties.tema,
        publishedAt: isPublished ? publishedAt : undefined,
        publishedBy: isPublished ? publishedBy : undefined,
        unpublishedChanges: status === 'pending' ? 'ja' : status === 'published' ? 'nei' : '',
        changedAt,
        changedBy,
        submissionTypes: formatSubmissionTypes(submissionTypes),
        subsequentSubmissionTypes: formatSubmissionTypes(reportSubsequentSubmissionTypes),
        signatureCount: signatures.length || 1,
        signerLabels: signatures
          .map((signature) => signature.label?.trim())
          .filter(Boolean)
          .join(', '),
        path,
        attachmentCount: attachments.length,
        attachmentNames: attachments
          .map((attachment) => attachment.vedleggstittel?.trim() || attachment.label?.trim())
          .join(', '),
        submissionUrl: submissionTypesUtils.isStaticPdfOnly(submissionTypes) ? '' : submissionUrl,
        digitalSubmissionUrl: submissionTypesUtils.isDigitalSubmission(submissionTypes)
          ? `${submissionUrl}?sub=digital`
          : '',
        staticPdfSubmissionUrl: submissionTypesUtils.isStaticPdf(submissionTypes) ? `${submissionUrl}/pdf` : '',
        paperSubmissionUrl: submissionTypesUtils.isPaperSubmission(submissionTypes) ? `${submissionUrl}?sub=paper` : '',
        paperNoCoverPageSubmissionUrl: submissionTypesUtils.isPaperNoCoverPageSubmission(submissionTypes)
          ? `${submissionUrl}?sub=papernocoverpage`
          : '',
        subsequentSubmissionUrl:
          hasAttachments &&
          (submissionTypesUtils.isDigitalSubmission(subsequentSubmissionTypes) ||
            submissionTypesUtils.isPaperSubmission(subsequentSubmissionTypes))
            ? subsequentSubmissionUrl
            : '',
        digitalSubsequentSubmissionUrl:
          submissionTypesUtils.isDigitalSubmission(subsequentSubmissionTypes) && hasAttachments
            ? `${subsequentSubmissionUrl}?sub=digital`
            : '',
        paperSubsequentSubmissionUrl:
          submissionTypesUtils.isPaperSubmission(subsequentSubmissionTypes) && hasAttachments
            ? `${subsequentSubmissionUrl}?sub=paper`
            : '',
        staticPdfSubsequentSubmissionUrl: hasStaticPdfSubsequentSubmission
          ? `${submissionUrl}/pdf?type=ettersending`
          : '',
        declarationType: declarationLabels[declarationType ?? DeclarationType.none],
        customDeclarationText: declarationType === DeclarationType.custom ? (properties.declarationText ?? '') : '',
        subsequentSubmissionDeadline: properties.ettersendelsesfrist,
        recipientAddress: recipientAddress(properties.mottaksadresseId, recipients),
        requiresPaperUnit: properties.enhetMaVelgesVedPapirInnsending ? 'ja' : '',
        hasGeneralInstructions: properties.descriptionOfSignatures?.trim() ? 'ja' : '',
        introPageEnabled: form.introPage?.enabled ? 'ja' : '',
        noLoginSubmissionUrl: submissionTypesUtils.isDigitalNoLoginSubmission(submissionTypes)
          ? `${submissionUrl}?sub=digitalnologin`
          : '',
        hasUploadedPdfs: pdfs.length ? 'ja' : '',
        staticPdfEnabled: submissionTypesUtils.isStaticPdf(submissionTypes) ? 'ja' : '',
      };
    }
  },
});

export { allFormsSummaryReport };
