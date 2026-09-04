import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { FyllutHttp, FyllutHttpHeaders } from '@navikt/skjemadigitalisering-shared-frontend';
import { describe, expect, it } from 'vitest';
import createApplicationService from './createApplicationService';

interface Request {
  method: string;
  url: string;
  body?: object;
}

const draftResponse = {
  innsendingsId: 'draft-123',
  hoveddokumentVariant: {
    document: {
      data: { data: { name: 'Ola' } } satisfies Submission,
      language: 'nb-NO' as const,
    },
  },
  endretDato: '2026-08-27T08:00:00Z',
  skalSlettesDato: '2026-09-27T08:00:00Z',
};

const encodedDraftResponse = {
  ...draftResponse,
  hoveddokumentVariant: {
    document: 'encoded-document',
  },
};

const activeTasksResponse = [
  {
    innsendingsId: 'draft-456',
    endretDato: '2026-08-28T08:00:00Z',
    soknadstype: 'soknad' as const,
  },
  {
    innsendingsId: 'attachment-789',
    endretDato: '2026-08-28T07:00:00Z',
    soknadstype: 'ettersendelse' as const,
  },
];

const createHttp = (responses: unknown[], requests: Request[]): FyllutHttp => {
  const nextResponse = <T>() => responses.shift() as T;

  return {
    get: async <T>(url: string) => {
      requests.push({ method: 'GET', url });
      return nextResponse<T>();
    },
    post: async <T>(url: string, body: object) => {
      requests.push({ method: 'POST', url, body });
      return nextResponse<T>();
    },
    put: async <T>(url: string, body: object) => {
      requests.push({ method: 'PUT', url, body });
      return nextResponse<T>();
    },
    delete: async <T>(url: string) => {
      requests.push({ method: 'DELETE', url });
      return nextResponse<T>();
    },
    postFile: async <T>(_url: string, _body: FormData, _headers?: FyllutHttpHeaders) => nextResponse<T>(),
    MimeType: { PDF: 'application/pdf' },
    isAuthenticationError: () => false,
  };
};

describe('createApplicationService', () => {
  it('maps active tasks to the neutral application contract', async () => {
    const requests: Request[] = [];
    const service = createApplicationService({
      http: createHttp([activeTasksResponse], requests),
      backendBaseUrl: '/fyllut',
    });

    await expect(service.getActiveTasks('NAV 01-02.03')).resolves.toEqual([
      { id: 'draft-456', modifiedAt: '2026-08-28T08:00:00Z', type: 'draft' },
      { id: 'attachment-789', modifiedAt: '2026-08-28T07:00:00Z', type: 'attachment' },
    ]);
    expect(requests).toEqual([
      {
        method: 'GET',
        url: '/fyllut/api/send-inn/aktive-opprettede-soknader/NAV 01-02.03',
      },
    ]);
  });

  it('maps backend draft responses to the neutral application contract', async () => {
    const requests: Request[] = [];
    const service = createApplicationService({
      http: createHttp([draftResponse, encodedDraftResponse, encodedDraftResponse, undefined], requests),
      backendBaseUrl: '/fyllut',
    });
    const submission = { data: { name: 'Ola' } };
    const request = {
      formPath: 'test-form',
      submission,
      language: 'en' as const,
      submissionMethod: 'digital' as const,
    };

    const expectedDraft = {
      id: 'draft-123',
      language: 'nb',
      submission: draftResponse.hoveddokumentVariant.document.data,
      modifiedAt: draftResponse.endretDato,
      deleteAt: draftResponse.skalSlettesDato,
    };

    await expect(service.getDraft('draft-123')).resolves.toEqual(expectedDraft);
    await expect(service.createDraft({ ...request, force: true })).resolves.toEqual({
      status: 'created',
      draft: {
        ...expectedDraft,
        language: 'en',
        submission,
      },
    });
    await expect(service.updateDraft({ ...request, id: 'draft-123' })).resolves.toEqual({
      ...expectedDraft,
      language: 'en',
      submission,
    });
    await service.deleteDraft('draft-123');

    expect(requests).toEqual([
      {
        method: 'GET',
        url: '/fyllut/api/send-inn/soknad/draft-123',
      },
      {
        method: 'POST',
        url: '/fyllut/api/send-inn/soknad?forceMellomlagring=true',
        body: request,
      },
      {
        method: 'PUT',
        url: '/fyllut/api/send-inn/soknad',
        body: { innsendingsId: 'draft-123', ...request },
      },
      {
        method: 'DELETE',
        url: '/fyllut/api/send-inn/soknad/draft-123',
      },
    ]);
  });

  it('maps an existing backend draft to a discriminated result', async () => {
    const service = createApplicationService({
      http: createHttp([{ status: 'soknadAlreadyExists' }], []),
      backendBaseUrl: '/fyllut',
    });

    await expect(
      service.createDraft({
        formPath: 'test-form',
        submission: { data: {} },
        language: 'nb',
        submissionMethod: 'digital',
      }),
    ).resolves.toEqual({ status: 'alreadyExists' });
  });
});
