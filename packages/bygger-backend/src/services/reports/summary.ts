import { Form, navFormUtils, SubmissionType, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import config from '../../config';
import { awaitReportCall, CsvReport } from './csvPipeline';
import { notTestForm, ReportDependencies, yesNo } from './types';

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
};

const summaryReport = ({ formsService }: ReportDependencies): CsvReport<SummaryRow> => ({
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
    for (const compact of forms.filter(notTestForm)) {
      signal.throwIfAborted();
      const form = await awaitReportCall(signal, () => formsService.get(compact.path));
      signal.throwIfAborted();
      const attachments = navFormUtils.getAttachmentProperties(form);
      const hasAttachments = navFormUtils.hasAttachment(form);
      const { title, path, properties, status, changedAt, changedBy, publishedAt, publishedBy } = compact;
      const { submissionTypes, subsequentSubmissionTypes } = properties;
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
        subsequentSubmissionTypes,
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
      };
    }
  },
});

export { summaryReport };
