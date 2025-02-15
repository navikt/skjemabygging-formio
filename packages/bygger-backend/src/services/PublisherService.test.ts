import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import nock from 'nock';
import { Backend } from '../Backend';
import PublisherService from './PublisherService';

describe('PublisherService', () => {
  let publisherService: PublisherService;

  let backendMock: Backend;

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  describe('publishForm', () => {
    describe('when publishing succeeds', () => {
      const testForm = { _id: '1', properties: {} } as NavFormType;

      beforeEach(() => {
        backendMock = { publishForm: () => 'git-commit-hash' } as unknown as Backend;
        publisherService = new PublisherService(backendMock);
      });

      it('returns the form', async () => {
        const translations = {};
        const { changed, form } = await publisherService.publishForm(testForm, translations);
        expect(changed).toBe(true);
        expect(form).toBeDefined();
      });
    });

    describe('when publishing fails', () => {
      beforeEach(() => {
        backendMock = {
          publishForm: () => {
            throw new Error('Commit failed');
          },
        } as unknown as Backend;
        publisherService = new PublisherService(backendMock);
      });

      it('an error is thrown', async () => {
        const translations = { en: {} };
        const form: NavFormType = { _id: '2', properties: {} } as NavFormType;
        let errorThrown = false;
        try {
          await publisherService.publishForm(form, translations);
        } catch (error: any) {
          errorThrown = true;
          expect(error.message).toBe('Publisering feilet');
        }
        expect(errorThrown).toBe(true);
      });
    });
  });

  describe('unpublishForm', () => {
    describe('when unpublish succeeds', () => {
      const testGitSha = '123456789A987654321';

      beforeEach(() => {
        backendMock = { unpublishForm: () => testGitSha } as unknown as Backend;
        publisherService = new PublisherService(backendMock);
      });

      it('returns the form', async () => {
        const testForm = {
          _id: '1',
          properties: { published: '2022-07-28T10:00:10.325Z', publishedBy: 'ernie' },
        } as NavFormType;
        const { changed, form } = await publisherService.unpublishForm(testForm);
        expect(changed).toBe(true);
        expect(form).toBeDefined();
      });
    });

    describe('when unpublish fails', () => {
      beforeEach(() => {
        backendMock = {
          unpublishForm: () => {
            throw new Error('Commit failed');
          },
        } as unknown as Backend;
        publisherService = new PublisherService(backendMock);
      });

      it('an error is thrown', async () => {
        const testForm = {
          _id: '1',
          properties: { published: '2022-07-28T10:00:10.325Z', publishedBy: 'ernie' },
        } as NavFormType;
        let errorThrown;

        try {
          await publisherService.unpublishForm(testForm);
        } catch (error: any) {
          errorThrown = true;
          expect(error.message).toBe('Avpublisering feilet');
        }

        expect(errorThrown).toBe(true);
      });
    });
  });
});
