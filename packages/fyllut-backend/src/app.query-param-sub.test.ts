import { NavFormType, SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import request from 'supertest';
import { afterEach, describe, it, vi } from 'vitest';
import { createApp } from './app';
import { config } from './config/config';

vi.mock('./dekorator', () => ({
  getDecorator: () => {},
  createRedirectUrl: () => '',
}));

const { formioApiServiceUrl } = config;

const mockForm = (formPath: string, submissionTypes: SubmissionType[]) => {
  nock(formioApiServiceUrl!)
    .get(`/form?type=form&tags=nav-skjema&path=${formPath}`)
    .reply(200, [
      {
        path: formPath,
        title: `Title for ${formPath}`,
        properties: {
          submissionTypes,
        },
      } as NavFormType,
    ]);
};

const authenticatedGet = (path: string) => request(createApp()).get(path).set('Authorization', 'Bearer test-token');

describe('Fyllut backend :: query param sub', () => {
  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error('Pending nock interceptors not used');
    }

    nock.abortPendingRequests();
    nock.cleanAll();
  });

  describe('when submissionTypes resolves a missing sub param', () => {
    it('redirects paper-only forms to sub=paper', async () => {
      mockForm('testform001', ['PAPER']);

      const res = await request(createApp()).get('/fyllut/testform001').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform001?sub=paper');
    });

    it('redirects paper-only forms to sub=paper ignoring static-pdf', async () => {
      mockForm('testform001', ['PAPER', 'STATIC_PDF']);

      const res = await request(createApp()).get('/fyllut/testform001').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform001?sub=paper');
    });

    it('redirects paper-only forms to sub=paper ignoring static-pdf and no-cover-page', async () => {
      mockForm('testform001', ['PAPER', 'STATIC_PDF', 'PAPER_NO_COVER_PAGE']);

      const res = await request(createApp()).get('/fyllut/testform001').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform001?sub=paper');
    });

    it('redirects paper-only forms to sub=paper ignoring no-cover-page', async () => {
      mockForm('testform001', ['PAPER', 'PAPER_NO_COVER_PAGE']);

      const res = await request(createApp()).get('/fyllut/testform001').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform001?sub=paper');
    });

    it('redirects digital-only forms to sub=digital and keeps query params', async () => {
      mockForm('testform101', ['DIGITAL']);

      const res = await request(createApp()).get('/fyllut/testform101?lang=en').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform101?lang=en&sub=digital');
    });

    it('redirects digital-only forms to sub=digital, ignoring static-pdf, and keeps query params', async () => {
      mockForm('testform101', ['DIGITAL', 'STATIC_PDF']);

      const res = await request(createApp()).get('/fyllut/testform101?lang=en').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform101?lang=en&sub=digital');
    });

    it('redirects digital-no-login-only forms to sub=digitalnologin', async () => {
      mockForm('testform102', ['DIGITAL_NO_LOGIN']);

      const res = await request(createApp()).get('/fyllut/testform102').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform102?sub=digitalnologin');
    });

    it('redirects digital-no-login-only forms to sub=digitalnologin, ignoring static-pdf', async () => {
      mockForm('testform102staticpdf', ['DIGITAL_NO_LOGIN', 'STATIC_PDF']);

      const res = await request(createApp()).get('/fyllut/testform102staticpdf').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform102staticpdf?sub=digitalnologin');
    });

    it('redirects multi-submission forms from subpages to the intro page when sub is missing', async () => {
      mockForm('testform103', ['PAPER', 'DIGITAL']);

      const res = await request(createApp()).get('/fyllut/testform103/oppsummering?lang=en').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform103?lang=en');
    });

    it('renders the intro page for multi-submission forms when sub is missing', async () => {
      mockForm('testform104', ['PAPER', 'DIGITAL']);

      await request(createApp()).get('/fyllut/testform104').expect(200);
    });
  });

  describe('when qpSub is present but not allowed for the form', () => {
    it('removes an unknown submission method from the redirect target', async () => {
      mockForm('testform105', ['PAPER']);

      const res = await request(createApp()).get('/fyllut/testform105?sub=papernocoverpage&lang=en').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform105?lang=en');
    });

    it('renders when the submission method is valid syntax but not allowed for the form', async () => {
      mockForm('testform106', ['PAPER']);

      await authenticatedGet('/fyllut/testform106?sub=digital').expect(200);
    });

    it('redirects to submission method selection for paper-no-cover-page forms', async () => {
      mockForm('testform107', ['PAPER_NO_COVER_PAGE']);

      const res = await request(createApp()).get('/fyllut/testform107?sub=paper&lang=en').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform107?lang=en');
    });
  });

  describe('when qpSub=papernocoverpage is allowed for the form', () => {
    it('renders for paper and paper-no-cover-page forms', async () => {
      mockForm('testform111', ['PAPER', 'PAPER_NO_COVER_PAGE']);

      await request(createApp()).get('/fyllut/testform111?sub=papernocoverpage').expect(200);
    });

    it('renders for digital and paper-no-cover-page forms', async () => {
      mockForm('testform112', ['DIGITAL', 'PAPER_NO_COVER_PAGE']);

      await request(createApp()).get('/fyllut/testform112?sub=papernocoverpage').expect(200);
    });

    it('renders for static-pdf and paper-no-cover-page forms', async () => {
      mockForm('testform113', ['STATIC_PDF', 'PAPER_NO_COVER_PAGE']);

      await request(createApp()).get('/fyllut/testform113?sub=papernocoverpage').expect(200);
    });
  });

  describe('when qpSub controls route redirects before form rendering', () => {
    it('forces sub=digital when innsendingsId is present', async () => {
      const res = await authenticatedGet('/fyllut/testform-summary?sub=paper&innsendingsId=123&lang=en').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform-summary?sub=digital&innsendingsId=123&lang=en');
    });

    it('redirects summary pages with sub=digital back to the intro page when innsendingsId is missing', async () => {
      const res = await authenticatedGet('/fyllut/testform-summary/oppsummering?sub=digital').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform-summary?sub=digital');
    });

    it('redirects digital-no-login requests to legitimasjon', async () => {
      const res = await request(createApp()).get('/fyllut/testform-loginless?sub=digitalnologin').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform-loginless/legitimasjon?sub=digitalnologin');
    });

    it('does not redirect away from legitimasjon for digital-no-login forms', async () => {
      mockForm('testform108', ['DIGITAL_NO_LOGIN']);

      await request(createApp()).get('/fyllut/testform108/legitimasjon?sub=digitalnologin').expect(200);
    });
  });

  describe('when accessing static pdf routes', () => {
    it('redirects static-pdf-only forms to 404 from the normal fill-in route', async () => {
      mockForm('pdfstaticonly', ['STATIC_PDF']);

      const res = await request(createApp()).get('/fyllut/pdfstaticonly').expect(302);

      expect(res.get('location')).toBe('/fyllut/404');
    });

    it('redirects static-pdf-only forms to 404 from normal fill-in subroutes', async () => {
      mockForm('testform109staticpdfsummary', ['STATIC_PDF']);

      const res = await request(createApp()).get('/fyllut/testform109staticpdfsummary/oppsummering').expect(302);

      expect(res.get('location')).toBe('/fyllut/404');
    });

    it('keeps fill-in routes available when static pdf is combined with a standard submission method', async () => {
      mockForm('testform109staticpdfpaper', ['PAPER', 'STATIC_PDF']);

      const res = await request(createApp()).get('/fyllut/testform109staticpdfpaper').expect(302);

      expect(res.get('location')).toBe('/fyllut/testform109staticpdfpaper?sub=paper');
    });

    it('returns 404 when static pdf is not enabled for the form', async () => {
      mockForm('testform109', ['PAPER']);

      await request(createApp()).get('/fyllut/testform109/pdf').expect(404);
    });

    it('renders when static pdf is enabled for the form', async () => {
      mockForm('testform110', ['STATIC_PDF']);

      await request(createApp()).get('/fyllut/testform110/pdf').expect(200);
    });
  });
});
