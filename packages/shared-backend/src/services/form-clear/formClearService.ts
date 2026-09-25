import {
  FormClearJob,
  FormClearOptions,
  FormClearPreview,
  FormClearStart,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createFormClearClient } from './formClearClient';

type FormClearClient = ReturnType<typeof createFormClearClient>;

type FormClearService = {
  preview: (options: FormClearOptions, token: string) => Promise<FormClearPreview>;
  start: (request: FormClearStart, token: string) => Promise<{ jobId: string }>;
  getActiveJob: (token: string) => Promise<FormClearJob>;
  getJob: (jobId: string, token: string) => Promise<FormClearJob>;
  getExistingPaths: (token: string) => Promise<string[]>;
};

const createFormClearService = (
  baseUrl: string,
  client: FormClearClient = createFormClearClient(baseUrl),
): FormClearService => ({
  preview: (options, token) => client.preview(options, token),
  start: (request, token) => client.start(request, token),
  getActiveJob: (token) => client.getActiveJob(token),
  getJob: (jobId, token) => client.getJob(jobId, token),
  getExistingPaths: async (token) => (await client.getForms(token)).map(({ path }) => path),
});

export { createFormClearService };
export type { FormClearService };
