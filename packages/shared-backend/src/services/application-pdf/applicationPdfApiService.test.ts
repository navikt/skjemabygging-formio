import { beforeEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('../../shared/http/http', () => ({
  default: {
    post,
  },
}));

import applicationPdfApiService from './applicationPdfApiService';

describe('applicationPdfApiService', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('returns content from familie-pdf json response', async () => {
    post.mockResolvedValue({ content: 'pdf-base64' });

    const pdf = await applicationPdfApiService.createPdf({
      baseUrl: 'http://familie-pdf',
      accessToken: 'token',
      body: {
        label: 'Test',
        pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
        skjemanummer: 'NAV 00-00.00',
        verdiliste: [],
        bunntekst: {
          upperleft: null,
          lowerleft: null,
          upperMiddle: null,
          lowerMiddle: null,
          upperRight: null,
        },
      },
    });

    expect(pdf).toBe('pdf-base64');
  });

  it('still returns string responses unchanged', async () => {
    post.mockResolvedValue('pdf-base64');

    const pdf = await applicationPdfApiService.createPdf({
      baseUrl: 'http://familie-pdf',
      accessToken: 'token',
      body: {
        label: 'Test',
        pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
        skjemanummer: 'NAV 00-00.00',
        verdiliste: [],
        bunntekst: {
          upperleft: null,
          lowerleft: null,
          upperMiddle: null,
          lowerMiddle: null,
          upperRight: null,
        },
      },
    });

    expect(pdf).toBe('pdf-base64');
  });
});
