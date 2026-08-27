import { ReceiptSummary } from '@navikt/skjemadigitalisering-shared-domain';
import { FyllutHttp, SubmissionService } from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  http: FyllutHttp;
  backendBaseUrl: string;
  createPdf: (url: string, body: object) => Promise<Blob>;
}

const createSubmissionService = ({ http, backendBaseUrl, createPdf }: Props): SubmissionService => ({
  submit: ({ application, formPath, submission, language, submissionMethod }) => {
    const applicationPath =
      application.type === 'draft' ? `digital-application/${application.id}` : 'nologin-application';
    const headers = application.type === 'noLogin' ? { NologinToken: application.token } : undefined;

    return http.post<{ pdfBase64: string; receipt: ReceiptSummary }>(
      `${backendBaseUrl}/api/send-inn/${applicationPath}`,
      {
        formPath,
        submission,
        language,
        submissionMethod,
      },
      headers,
    );
  },
  createDocument: ({ documentType, formPath, submission, language, submissionMethod, navUnitNumber }) =>
    createPdf(
      `${backendBaseUrl}/api/documents${
        documentType === 'application' ? '/application' : '/cover-page-and-application'
      }`,
      {
        language,
        formPath,
        submission: JSON.stringify(submission),
        submissionMethod,
        enhetNummer: navUnitNumber,
      },
    ),
});

export default createSubmissionService;
