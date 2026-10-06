import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderIndex from './renderIndex';
import { formService } from './services';
import { mockRequest, mockResponse } from './test/testHelpers';

vi.mock('./services', () => ({
  formService: { getForm: vi.fn() },
}));

vi.mock('./dekorator', () => ({
  getDecorator: vi.fn().mockResolvedValue({}),
  createRedirectUrl: () => '',
}));

const testForm: Form = {
  path: 'testformlang',
  title: 'Test form',
  skjemanummer: '',
  components: [],
  status: 'published',
  publishedLanguages: ['nb'],
  properties: {
    skjemanummer: '',
    tema: '',
    submissionTypes: ['PAPER'],
    subsequentSubmissionTypes: [],
  },
};

const createHandlerMocks = (path: string, query: Record<string, string>) => {
  const request = mockRequest({ query });
  request.baseUrl = path;
  request.originalUrl = `${path}?${new URLSearchParams(query)}`;
  const response = mockResponse();
  response.locals = { formId: testForm.path };
  response.setHeader = vi.fn();
  response.redirect = vi.fn();
  response.render = vi.fn();
  response.status.mockReturnValue(response);
  return { request, response, next: vi.fn() };
};

describe('renderIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formService.getForm).mockResolvedValue(testForm);
  });

  it('selects the publication metadata needed to validate languages', async () => {
    const { request, response, next } = createHandlerMocks('/fyllut/testformlang', { sub: 'paper' });

    await renderIndex(request, response, next);

    expect(formService.getForm).toHaveBeenCalledWith({
      formPath: testForm.path,
      select: expect.arrayContaining(['properties', 'publishedLanguages', 'status']),
    });
    expect(response.render).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('bypasses publication-language validation on the static PDF route', async () => {
    vi.mocked(formService.getForm).mockResolvedValue({
      ...testForm,
      properties: { ...testForm.properties, submissionTypes: ['STATIC_PDF'] },
    });
    const { request, response, next } = createHandlerMocks('/fyllut/testformlang/pdf', { lang: 'en' });

    await renderIndex(request, response, next);

    expect(response.redirect).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.render).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
