import { Form, NavFormType, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Registry } from 'prom-client';
import type { MockInstance } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFormService } from './formService';

describe('createFormService', () => {
  const baseUrl = 'http://forms-api.test';
  let tempDir: string | undefined;

  const apiForm = {
    id: 1,
    path: 'nav123456',
    title: 'Test form',
    skjemanummer: 'NAV 12-34.56',
    properties: {
      skjemanummer: 'NAV 12-34.56',
      tema: 'TSO',
      submissionTypes: ['PAPER'],
      subsequentSubmissionTypes: ['PAPER'],
    },
    components: [],
    changedAt: '2024-09-19T12:21:31.135Z',
    publishedAt: '2024-09-20T12:21:31.135Z',
    publishedLanguages: ['nb'],
  } as unknown as Form;

  const navForm = {
    id: 2,
    path: 'nav654321',
    title: 'Stored form',
    changedAt: '2024-09-21T10:11:12.000Z',
    properties: {
      skjemanummer: 'NAV 65-43.21',
      submissionTypes: ['DIGITAL'],
      publishedLanguages: ['nn-NO'],
    },
    components: [],
    display: 'wizard',
    name: 'Stored form',
    tags: [],
    type: 'form',
  } as unknown as NavFormType;

  const createService = (props?: Omit<Parameters<typeof createFormService>[0], 'baseUrl'>) =>
    createFormService({
      baseUrl,
      ...props,
    });

  const mockFetchResponse = (body: BodyInit, status: number, contentType: string) =>
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(body, {
        status,
        headers: {
          'Content-Type': contentType,
        },
      }),
    );

  const expectGetRequest = (fetchSpy: MockInstance<typeof fetch>, url: string) => {
    expect(fetchSpy).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  };

  const writeFormsToTempDir = (...forms: NavFormType[]) => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'form-service-test-'));
    forms.forEach((form) => {
      fs.writeFileSync(path.join(tempDir!, `${form.path}.json`), JSON.stringify(form));
    });
    return tempDir;
  };

  afterEach(() => {
    vi.restoreAllMocks();
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  describe('getForms', () => {
    it('requires select properties', async () => {
      const service = createService({ formsApiStaging: true });

      await expect(service.getForms({ select: undefined as never })).rejects.toMatchObject({
        errorCode: 'BAD_REQUEST',
        message: 'Select properties are required to fetch forms',
      });
    });

    it('gets forms through the forms api when staging is enabled', async () => {
      const fetchSpy = mockFetchResponse(JSON.stringify([apiForm]), 200, 'application/json');
      const service = createService({ formsApiStaging: true });

      await expect(service.getForms({ select: ['id', 'title'] })).resolves.toEqual([apiForm]);
      expectGetRequest(fetchSpy, `${baseUrl}/v1/forms?select=id%2Ctitle`);
    });

    it('maps forms from disk when neither staging nor mocks are enabled', async () => {
      const formsLocation = writeFormsToTempDir(navForm);
      const fetchSpy = vi.spyOn(global, 'fetch');
      const service = createService({ formsLocation });

      await expect(
        service.getForms({ select: ['id', 'title', 'skjemanummer', 'changedAt', 'properties'] }),
      ).resolves.toMatchObject([
        expect.objectContaining({
          id: 2,
          path: 'nav654321',
          title: 'Stored form',
          skjemanummer: 'NAV 65-43.21',
          changedAt: '2024-09-21T10:11:12.000Z',
          properties: expect.objectContaining({
            skjemanummer: 'NAV 65-43.21',
            submissionTypes: ['DIGITAL'],
          }),
        }),
      ]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('getForm', () => {
    it('gets a form through the forms api with select when mocks are enabled', async () => {
      const fetchSpy = mockFetchResponse(JSON.stringify(apiForm), 200, 'application/json');
      const service = createService({ mocksEnabled: true });

      await expect(service.getForm({ formPath: 'nav123456', select: ['title', 'properties'] })).resolves.toEqual(
        apiForm,
      );
      expectGetRequest(fetchSpy, `${baseUrl}/v1/forms/nav123456?select=title%2Cproperties`);
    });

    it('gets a full form through the forms api without select when staging is enabled', async () => {
      const fetchSpy = mockFetchResponse(JSON.stringify(apiForm), 200, 'application/json');
      const service = createService({ formsApiStaging: true });

      await expect(service.getForm({ formPath: 'nav123456' })).resolves.toEqual(apiForm);
      expectGetRequest(fetchSpy, `${baseUrl}/v1/forms/nav123456`);
    });

    it('maps a form from disk when neither staging nor mocks are enabled', async () => {
      const formsLocation = writeFormsToTempDir(navForm);
      const fetchSpy = vi.spyOn(global, 'fetch');
      const service = createService({ formsLocation });

      await expect(service.getForm({ formPath: 'nav654321' })).resolves.toMatchObject(
        expect.objectContaining({
          id: 2,
          path: 'nav654321',
          title: 'Stored form',
          skjemanummer: 'NAV 65-43.21',
          changedAt: '2024-09-21T10:11:12.000Z',
          properties: expect.objectContaining({
            skjemanummer: 'NAV 65-43.21',
            submissionTypes: ['DIGITAL'],
          }),
        }),
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('offers every language for forms-api forms without forwarding languages to forms-api', async () => {
      const fetchSpy = mockFetchResponse(JSON.stringify(apiForm), 200, 'application/json');
      const service = createService({ formsApiStaging: true });

      await expect(service.getForm({ formPath: 'nav123456', select: ['title', 'languages'] })).resolves.toMatchObject({
        languages: ['nb', 'nn', 'en'],
      });
      expectGetRequest(fetchSpy, `${baseUrl}/v1/forms/nav123456?select=title%2CpublishedLanguages%2Cstatus`);
    });

    it('offers only published languages for published forms-api forms', async () => {
      mockFetchResponse(JSON.stringify({ ...apiForm, status: 'published' }), 200, 'application/json');
      const service = createService({ formsApiStaging: true });

      await expect(service.getForm({ formPath: 'nav123456', select: ['title', 'languages'] })).resolves.toMatchObject({
        languages: ['nb'],
      });
    });

    it('offers only published languages for forms from disk', async () => {
      const formsLocation = writeFormsToTempDir(navForm);
      const service = createService({ formsLocation });

      await expect(service.getForm({ formPath: 'nav654321', select: ['title', 'languages'] })).resolves.toMatchObject({
        languages: ['nb', 'nn'],
      });
    });

    it('throws not found when a disk-backed form does not exist', async () => {
      const formsLocation = writeFormsToTempDir(navForm);
      const service = createService({ formsLocation });

      await expect(service.getForm({ formPath: 'missingform' })).rejects.toEqual(
        new ResponseError('NOT_FOUND', `Form with path missingform not found in directory ${formsLocation}`),
      );
    });

    it('treats invalid form paths as not found without calling forms-api or reading disk', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      const readdirSpy = vi.spyOn(fs, 'readdirSync');
      const registry = new Registry();
      const stagingService = createService({
        formsApiStaging: true,
        metrics: { appName: 'fyllut', registry },
      });
      const staticService = createService({
        formsLocation: '/non-existent-directory',
        metrics: { appName: 'fyllut', registry },
      });

      await expect(stagingService.getForm({ formPath: 'index.html' })).rejects.toEqual(
        new ResponseError('NOT_FOUND', 'Form with path index.html not found'),
      );
      await expect(staticService.getForm({ formPath: 'missing-form' })).rejects.toEqual(
        new ResponseError('NOT_FOUND', 'Form with path missing-form not found'),
      );

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(readdirSpy).not.toHaveBeenCalled();
      const metrics = await registry.metrics();
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="hit"} 0');
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="miss"} 2');
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="error"} 0');
    });

    it('records hit, miss, and error metrics for disk-backed form fetches', async () => {
      const formsLocation = writeFormsToTempDir(navForm);
      const registry = new Registry();
      const service = createService({
        formsLocation,
        metrics: { appName: 'fyllut', registry },
      });

      expect(await registry.metrics()).toContain('fyllut_form_definition_fetches_total{result="hit"} 0');
      expect(await registry.metrics()).toContain('fyllut_form_definition_fetches_total{result="miss"} 0');
      expect(await registry.metrics()).toContain('fyllut_form_definition_fetches_total{result="error"} 0');

      await service.getForm({ formPath: 'nav654321' });
      await service.getForm({ formPath: 'nav654321', select: ['title', 'languages'] });
      await expect(service.getForm({ formPath: 'missingform' })).rejects.toMatchObject({ errorCode: 'NOT_FOUND' });

      const brokenService = createService({
        formsLocation: path.join(formsLocation, 'missing-dir'),
        metrics: { appName: 'fyllut', registry },
      });
      await expect(brokenService.getForm({ formPath: 'nav654321' })).rejects.toThrow();

      const metrics = await registry.metrics();
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="hit"} 2');
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="miss"} 1');
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="error"} 1');
    });

    it('records hit, miss, and error metrics for forms-api form fetches', async () => {
      const registry = new Registry();
      const service = createService({
        formsApiStaging: true,
        metrics: { appName: 'fyllut', registry },
      });

      mockFetchResponse(JSON.stringify(apiForm), 200, 'application/json');
      await service.getForm({ formPath: 'nav123456' });

      mockFetchResponse(JSON.stringify({ message: 'Not found' }), 404, 'application/json');
      await expect(service.getForm({ formPath: 'missingform' })).rejects.toMatchObject({ errorCode: 'NOT_FOUND' });

      mockFetchResponse(JSON.stringify({ message: 'Internal error' }), 500, 'application/json');
      await expect(service.getForm({ formPath: 'nav123456' })).rejects.toMatchObject({
        errorCode: 'INTERNAL_SERVER_ERROR',
      });

      const metrics = await registry.metrics();
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="hit"} 1');
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="miss"} 1');
      expect(metrics).toContain('fyllut_form_definition_fetches_total{result="error"} 1');
    });
  });
});
