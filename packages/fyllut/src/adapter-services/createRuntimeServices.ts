import { FyllutHttp, RuntimeServices } from '@navikt/skjemadigitalisering-shared-frontend';
import createApplicationService from './createApplicationService';
import createAttachmentService from './createAttachmentService';
import createFormDataService from './createFormDataService';
import createSessionService from './createSessionService';
import createSubmissionService from './createSubmissionService';

interface Props {
  http: FyllutHttp;
  backendBaseUrl: string;
  innsendingsId?: string;
}

const createRuntimeServices = ({ http, backendBaseUrl, innsendingsId }: Props): RuntimeServices => ({
  applications: createApplicationService({ http, backendBaseUrl }),
  attachments: createAttachmentService({ http, backendBaseUrl }),
  formData: createFormDataService({ http, backendBaseUrl, innsendingsId }),
  sessions: createSessionService({ http, backendBaseUrl }),
  submissions: createSubmissionService({ http, backendBaseUrl }),
});

export default createRuntimeServices;
