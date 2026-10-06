import {
  FormClearJob,
  FormClearOptions,
  FormClearPreview,
  FormClearStart,
} from '@navikt/skjemadigitalisering-shared-domain';

class FormClearApiError extends Error {
  constructor(readonly status: number) {
    super(`Request failed (${status})`);
  }
}

const request = async <T>(
  url: string,
  method: 'GET' | 'POST',
  body?: FormClearOptions | FormClearStart,
): Promise<T> => {
  const response = await fetch(url, {
    method,
    ...(body && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    throw new FormClearApiError(response.status);
  }
  return response.json() as Promise<T>;
};

const formClearApi = {
  preview: (options: FormClearOptions) => request<FormClearPreview>('/api/form-clear/preview', 'POST', options),
  start: (requestBody: FormClearStart) => request<{ jobId: string }>('/api/form-clear/jobs', 'POST', requestBody),
  getActiveJob: () => request<FormClearJob>('/api/form-clear/jobs/active', 'GET'),
  getJob: (jobId: string) => request<FormClearJob>(`/api/form-clear/jobs/${encodeURIComponent(jobId)}`, 'GET'),
  cleanup: () =>
    request<{ removed: string[]; failed: { path: string; error: string }[] }>(
      '/api/form-clear/publish-cleanup',
      'POST',
    ),
};

export { formClearApi, FormClearApiError };
