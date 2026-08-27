import { FetchHeader } from '@navikt/skjemadigitalisering-shared-components';
import { FyllutHttp, RuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
import createApplicationService from './createApplicationService';
import createAttachmentService from './createAttachmentService';
import createFormDataService from './createFormDataService';
import createSessionService from './createSessionService';
import createSubmissionService from './createSubmissionService';

type RuntimeHttp = FyllutHttp & {
  post: <T>(url: string, body: object, headers?: FetchHeader) => Promise<T>;
  MimeType: { PDF: NonNullable<FetchHeader['Accept']> };
};

interface Props {
  http: RuntimeHttp;
  backendBaseUrl: string;
  innsendingsId?: string;
}

const createRuntimeServices = ({ http, backendBaseUrl, innsendingsId }: Props): RuntimeServices => ({
  applications: createApplicationService({ http, backendBaseUrl }),
  attachments: createAttachmentService({ http, backendBaseUrl }),
  formData: createFormDataService({ http, backendBaseUrl, innsendingsId }),
  sessions: createSessionService({ http, backendBaseUrl }),
  submissions: createSubmissionService({
    http,
    backendBaseUrl,
    createPdf: (url, body) =>
      http.post<Blob>(url, body, {
        Accept: http.MimeType.PDF,
      }),
  }),
});

export default createRuntimeServices;
