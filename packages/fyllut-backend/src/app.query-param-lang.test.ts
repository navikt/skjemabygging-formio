import { Form, FormStatus, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import request from 'supertest';
import { afterEach, describe, it, vi } from 'vitest';
import { createApp } from './app';
import { config } from './config/config';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const { formsApiUrl } = config;

interface MockFormProps {
  publishedLanguages?: string[];
  status?: FormStatus;
  submissionTypes?: SubmissionType[];
}

const mockForm = (formPath: string, props: MockFormProps) => {
  const { publishedLanguages, status = 'published', submissionTypes = ['PAPER'] } = props;
  const requestedSelect: string[] = [];
  nock(formsApiUrl)
    .get(`/v1/forms/${formPath}`)
    .query((query) => {
      requestedSelect.push(...String(query.select ?? '').split(','));
      return true;
    })
    .reply(200, {
      path: formPath,
      title: `Title for ${formPath}`,
      status,
      publishedLanguages,
      properties: {
        submissionTypes,
      },
    } as Partial<Form>);
  return requestedSelect;
};

describe('Fyllut backend :: query param lang', () => {
  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error('Pending nock interceptors not used');
    }

    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it('selects the fields needed to validate lang from forms-api', async () => {
    const requestedSelect = mockForm('testformlang000', { publishedLanguages: ['nb'] });

    await request(createApp()).get('/fyllut/testformlang000?sub=paper');

    expect(requestedSelect).toEqual(expect.arrayContaining(['properties', 'publishedLanguages', 'status']));
  });

  describe('when the requested language is not published', () => {
    it.each(['lang=en&lang=en', 'lang=en&lang=nb-NO', 'lang=nb-NO&lang=en'])(
      'removes repeated language parameters: %s',
      async (languageParams) => {
        mockForm('testformlangrepeated', { publishedLanguages: ['nb', 'nn'] });

        const res = await request(createApp())
          .get(`/fyllut/testformlangrepeated?sub=paper&${languageParams}`)
          .expect(302);

        expect(res.get('location')).toBe('/fyllut/testformlangrepeated?sub=paper');
      },
    );

    it('removes lang and keeps other query params', async () => {
      mockForm('testformlang001', { publishedLanguages: ['nn', 'nb'] });

      const res = await request(createApp()).get('/fyllut/testformlang001?lang=en&sub=paper').expect(302);

      expect(res.get('location')).toBe('/fyllut/testformlang001?sub=paper');
    });

    it('keeps the requested sub page', async () => {
      mockForm('testformlang002', { publishedLanguages: ['nn', 'nb'] });

      const res = await request(createApp()).get('/fyllut/testformlang002/veiledning?sub=paper&lang=en').expect(302);

      expect(res.get('location')).toBe('/fyllut/testformlang002/veiledning?sub=paper');
    });

    it('removes lang when no languages are published', async () => {
      mockForm('testformlang003', { publishedLanguages: [] });

      const res = await request(createApp()).get('/fyllut/testformlang003?sub=paper&lang=nn-NO').expect(302);

      expect(res.get('location')).toBe('/fyllut/testformlang003?sub=paper');
    });

    it('removes an unknown language', async () => {
      mockForm('testformlang004', { publishedLanguages: ['nn', 'nb', 'en'] });

      const res = await request(createApp()).get('/fyllut/testformlang004?sub=paper&lang=pl').expect(302);

      expect(res.get('location')).toBe('/fyllut/testformlang004?sub=paper');
    });
  });

  describe('when the requested language is published', () => {
    it('renders when lang matches a forms-api language code', async () => {
      mockForm('testformlang101', { publishedLanguages: ['nn', 'nb'] });

      await request(createApp()).get('/fyllut/testformlang101?sub=paper&lang=nn-NO').expect(200);
    });

    it('renders when lang matches a legacy language code', async () => {
      mockForm('testformlang102', { publishedLanguages: ['nn-NO', 'en'] });

      await request(createApp()).get('/fyllut/testformlang102?sub=paper&lang=nn-NO').expect(200);
    });

    it('renders English when en is published', async () => {
      mockForm('testformlang103', { publishedLanguages: ['nb', 'en'] });

      await request(createApp()).get('/fyllut/testformlang103?sub=paper&lang=en').expect(200);
    });

    it('always renders bokmål', async () => {
      mockForm('testformlang104', { publishedLanguages: ['en'] });

      await request(createApp()).get('/fyllut/testformlang104?sub=paper&lang=nb-NO').expect(200);
    });
  });

  describe('when published languages cannot be trusted', () => {
    it('keeps lang when the form revision is not published', async () => {
      mockForm('testformlang201', { publishedLanguages: ['nn', 'nb'], status: 'pending' });

      await request(createApp()).get('/fyllut/testformlang201?sub=paper&lang=en').expect(200);
    });

    it('keeps lang when published languages are missing', async () => {
      mockForm('testformlang202', {});

      await request(createApp()).get('/fyllut/testformlang202?sub=paper&lang=en').expect(200);
    });
  });

  it('keeps lang on the static pdf route', async () => {
    mockForm('testformlang301', { publishedLanguages: ['nb'], submissionTypes: ['STATIC_PDF'] });

    await request(createApp()).get('/fyllut/testformlang301/pdf?lang=en').expect(200);
  });
});
