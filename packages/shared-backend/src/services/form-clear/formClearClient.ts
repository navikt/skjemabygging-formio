import {
  FormClearJob,
  FormClearOptions,
  FormClearPreview,
  FormClearStart,
} from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';

const createFormClearClient = (baseUrl: string) => {
  const jobsUrl = `${baseUrl}/api/form-clear/jobs`;
  return {
    preview: (options: FormClearOptions, accessToken: string) =>
      http.post<FormClearPreview>(`${baseUrl}/api/form-clear/preview`, options, { accessToken }),
    start: (request: FormClearStart, accessToken: string) =>
      http.post<{ jobId: string }>(jobsUrl, request, { accessToken }),
    getActiveJob: (accessToken: string) => http.get<FormClearJob>(`${jobsUrl}/active`, { accessToken }),
    getJob: (jobId: string, accessToken: string) =>
      http.get<FormClearJob>(`${jobsUrl}/${encodeURIComponent(jobId)}`, { accessToken }),
    getForms: (accessToken: string) =>
      http.get<{ path: string }[]>(`${baseUrl}/v1/forms?select=path&includeDeleted=true`, { accessToken }),
  };
};

export { createFormClearClient };
