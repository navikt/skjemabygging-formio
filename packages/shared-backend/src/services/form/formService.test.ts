import { Form, NavFormType, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

    it('throws not found when a disk-backed form does not exist', async () => {
      const formsLocation = writeFormsToTempDir(navForm);
      const service = createService({ formsLocation });

      await expect(service.getForm({ formPath: 'missing-form' })).rejects.toEqual(
        new ResponseError('NOT_FOUND', `Form with path missing-form not found in directory ${formsLocation}`),
      );
    });
  });
});
