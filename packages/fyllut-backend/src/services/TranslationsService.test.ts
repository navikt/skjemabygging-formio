import { errorHandler, requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import path from 'path';
import request from 'supertest';
import { logger as errorLogger } from '../../../shared-backend/src/shared/logger/logger';
import { FyllutBackendConfig } from '../config/types';
import legacyErrorToResponseError from '../middleware/legacyErrorToResponseError';
import TranslationsService from './TranslationsService';

const testConfig: FyllutBackendConfig = {
  translationDir: path.join(__dirname + '/testdata/translations'),
  resourcesDir: path.join(__dirname + '/testdata/resources'),
} as FyllutBackendConfig;

describe('TranslationService', () => {
  describe('getTranslationsForLanguage', () => {
    it('loads english translations', async () => {
      const translationsService = new TranslationsService(testConfig);
      const translationsForLanguage = await translationsService.getTranslationsForLanguage('nav123456', 'en');
      expect(translationsForLanguage).toEqual({
        April: 'April',
        August: 'August',
        Avbryt: 'Cancel',
        Avslutt: 'Exit',
        'Bor du i Norge?': 'Do you live in Norway?',
        'E-post': 'E-mail',
        'Laster...': 'Loading...',
        'Legg ved': 'Attach',
        Oppsummering: 'Summary',
        Organisasjonsnummer: 'Organisation number',
        Personopplysninger: 'Personal information',
        Postboks: 'PO box',
        Postboksadresse: 'PO box address',
        Postkode: 'Zip code',
        Postnummer: 'Zip code',
        Poststed: 'City',
        Region: 'Region',
        Telefonnummer: 'Telephone number',
        '{{count}} valg tilgjengelig': '{{count}} options available',
        'Jeg skal sende inn vedlegget': 'I will submit the attachment',
      });
    });

    it('loads nynorsk translations', async () => {
      const translationsService = new TranslationsService(testConfig);
      const translationsForLanguage = await translationsService.getTranslationsForLanguage('nav123456', 'nn');
      expect(translationsForLanguage).toEqual({
        'Jeg skal sende inn vedlegget': 'Eg skal sende inn vedlegget',
      });
    });

    it('loads empty transdlations when form has no translations', async () => {
      const translationsService = new TranslationsService(testConfig);
      const translationsForLanguage = await translationsService.getTranslationsForLanguage('nav123457', 'nn');
      expect(translationsForLanguage).toEqual({});
    });

    it('fails when formPath is invalid', async () => {
      const translationsService = new TranslationsService(testConfig);
      await expect(translationsService.getTranslationsForLanguage('&$%', 'nn')).rejects.toMatchObject({
        errorCode: 'BAD_REQUEST',
        message: 'Form path contains invalid characters.',
      });
      await expect(translationsService.loadTranslation('&$%')).rejects.toMatchObject({
        errorCode: 'BAD_REQUEST',
        message: 'Form path contains invalid characters.',
      });
    });

    it('responds with a safe 400 and one non-error log for an invalid translation path', async () => {
      const app = express();
      const translationsService = new TranslationsService(testConfig);
      const handlerWarning = vi.spyOn(errorLogger, 'warn');
      const handlerError = vi.spyOn(errorLogger, 'error');
      app.get('/translations/:form', async (req, res) =>
        res.json(await translationsService.loadTranslation(requestUtil.getStringParam(req, 'form')!)),
      );
      app.use(legacyErrorToResponseError);
      app.use(errorHandler);

      const response = await request(app).get('/translations/%26%24%25').expect(400);

      expect(response.body).toMatchObject({
        errorCode: 'BAD_REQUEST',
        message: 'Form path contains invalid characters.',
      });
      expect(JSON.stringify(response.body)).not.toContain('&$%');
      expect(handlerWarning).toHaveBeenCalledOnce();
      expect(handlerError).not.toHaveBeenCalled();
      handlerWarning.mockRestore();
      handlerError.mockRestore();
    });
  });
});
