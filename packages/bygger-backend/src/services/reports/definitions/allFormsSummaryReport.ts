import {
  DeclarationType,
  Form,
  navFormUtils,
  Recipient,
  ResponseError,
  SubmissionType,
  submissionTypesUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import config from '../../../config';
import { awaitReportCall, CsvReport } from '../csvPipeline';
import { isNotTestForm, ReportDependencies, yesNo } from '../types';

type SummaryRow = {
  formNumber: string;
  formTitle: string;
  topic: string;
  publishedAt?: string;
  publishedBy?: string;
  unpublishedChanges: string;
  changedAt?: string;
  changedBy?: string;
  submissionTypes: SubmissionType[];
  subsequentSubmissionTypes: SubmissionType[];
  signatureCount: number;
  path: string;
  hasAttachments: string;
  attachmentCount: number;
  attachmentNames: string;
  submissionUrl: string;
  paperSubmissionUrl: string;
  subsequentSubmissionUrl: string;
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
  firstPublishedAt: '';
};

const declarationLabels: Record<DeclarationType, string> = {
  [DeclarationType.none]: 'Ingen',
  [DeclarationType.default]: 'Standard',
  [DeclarationType.custom]: 'Tilpasset',
};

const recipientAddress = (recipientId: string | undefined, recipients: Map<string | undefined, Recipient>) => {
  if (!recipientId) return 'Standard';
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
    path: 'path',
    hasAttachments: 'har vedlegg',
    attachmentCount: 'antall vedlegg',
    attachmentNames: 'vedleggsnavn',
    submissionUrl: 'innsendingsurl',
    paperSubmissionUrl: 'innsendingsurl (papir)',
    subsequentSubmissionUrl: 'ettersendingsurl',
    paperSubsequentSubmissionUrl: 'ettersendingsurl (papir)',
    staticPdfSubsequentSubmissionUrl: 'ettersendingsurl (static PDF)',
    declarationType: 'erklæringstype',
    customDeclarationText: 'tilpasset erklæringstekst',
    subsequentSubmissionDeadline: 'ettersendelsesfrist',
    recipientAddress: 'mottaksadresse',
    requiresPaperUnit: 'må velge enhet (papir)',
    hasGeneralInstructions: 'generelle instruksjoner',
    introPageEnabled: 'introside aktivert',
    noLoginSubmissionUrl: 'innsendingsurl (nologin)',
    hasUploadedPdfs: 'har opplastede PDF-er',
    staticPdfEnabled: 'STATIC_PDF aktivert',
    firstPublishedAt: 'første publiseringsdato',
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
      const hasAttachments = navFormUtils.hasAttachment(form);
      const { title, path, properties, status, changedAt, changedBy, publishedAt, publishedBy } = compact;
      const { submissionTypes = [], subsequentSubmissionTypes = [], declarationType } = properties;
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
        submissionTypes,
        subsequentSubmissionTypes: reportSubsequentSubmissionTypes,
        signatureCount: properties.signatures?.length || 1,
        path,
        hasAttachments: yesNo(hasAttachments),
        attachmentCount: attachments.length,
        attachmentNames: attachments.map((attachment) => attachment.vedleggstittel).join(','),
        submissionUrl,
        paperSubmissionUrl: submissionTypesUtils.isPaperNoCoverPageSubmission(submissionTypes)
          ? submissionUrl
          : submissionTypesUtils.isPaperSubmission(submissionTypes)
            ? `${submissionUrl}?sub=paper`
            : '',
        subsequentSubmissionUrl: hasAttachments ? subsequentSubmissionUrl : '',
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
        requiresPaperUnit: yesNo(properties.enhetMaVelgesVedPapirInnsending),
        hasGeneralInstructions: yesNo(properties.descriptionOfSignatures?.trim()),
        introPageEnabled: yesNo(form.introPage?.enabled),
        noLoginSubmissionUrl: submissionTypesUtils.isDigitalNoLoginSubmission(submissionTypes)
          ? `${submissionUrl}?sub=digitalnologin`
          : '',
        hasUploadedPdfs: yesNo(pdfs.length),
        staticPdfEnabled: yesNo(submissionTypesUtils.isStaticPdf(submissionTypes)),
        // Stage 1 has no authoritative first-publication contract. Never substitute the latest publication date.
        firstPublishedAt: '',
      };
    }
  },
});

export { allFormsSummaryReport };
