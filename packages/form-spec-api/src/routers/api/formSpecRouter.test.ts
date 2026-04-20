import { formApiService } from '@navikt/skjemadigitalisering-shared-backend';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import request from 'supertest';
import { beforeEach, vi } from 'vitest';
import { createApp } from '../../app';
import { FormNotFoundError } from './helpers/errors';

vi.mock('@navikt/skjemadigitalisering-shared-backend', async () => {
  const actual = await vi.importActual<typeof import('@navikt/skjemadigitalisering-shared-backend')>(
    '@navikt/skjemadigitalisering-shared-backend',
  );

  return {
    ...actual,
    formApiService: {
      ...actual.formApiService,
      getForm: vi.fn(),
    },
    paramValidation: actual.paramValidation,
  };
});

const mockedGetForm = vi.mocked(formApiService.getForm);

const createForm = (): Form => ({
  components: [
    {
      input: true,
      key: 'firstName',
      label: 'First name',
      type: 'textfield',
      validate: { required: true },
    },
  ],
  skjemanummer: 'NAV 00-00.00',
  path: 'nav123456',
  properties: {
    skjemanummer: 'NAV 00-00.00',
    submissionTypes: [],
    subsequentSubmissionTypes: [],
    tema: 'TEST',
  },
  title: 'Test form',
});

describe('formSpecRouter', () => {
  beforeEach(() => {
    mockedGetForm.mockReset();
  });

  it('returns a schema response', async () => {
    mockedGetForm.mockResolvedValue(createForm());

    const response = await request(createApp()).get('/api/forms/nav123456/spec').expect(200);

    expect(response.header['content-type']).toMatch(/application\/schema\+json/);
    expect(response.body.properties.data.properties.data.properties.firstName).toEqual({
      title: 'First name',
      type: 'string',
    });
    expect(mockedGetForm).toHaveBeenCalledWith(
      expect.objectContaining({
        formPath: 'nav123456',
      }),
    );
  });

  it('returns the latest form revision from the shared form service', async () => {
    mockedGetForm.mockResolvedValue({ ...createForm(), revision: 3 });

    const response = await request(createApp()).get('/api/forms/nav123456/spec').expect(200);

    expect(mockedGetForm).toHaveBeenCalledWith(
      expect.objectContaining({
        formPath: 'nav123456',
      }),
    );
    expect(response.body.$id).toBe('https://skjemabygging.nav.no/forms/nav123456/spec?revision=3');
  });

  it('returns 404 when the form is missing', async () => {
    mockedGetForm.mockRejectedValue(new FormNotFoundError('nav654321'));

    const response = await request(createApp()).get('/api/forms/nav654321/spec').expect(404);

    expect(response.body.errorCode).toBe('NOT_FOUND');
  });
});

describe('employee formSpecRouter', () => {
  beforeEach(() => {
    mockedGetForm.mockReset();
  });

  it('returns a schema response via the employee endpoint', async () => {
    mockedGetForm.mockResolvedValue(createForm());

    const response = await request(createApp()).get('/api/employee/forms/nav123456/spec').expect(200);

    expect(response.header['content-type']).toMatch(/application\/schema\+json/);
    expect(response.body.properties.data.properties.data.properties.firstName).toEqual({
      title: 'First name',
      type: 'string',
    });
  });

  it('returns 404 when the form is missing via the employee endpoint', async () => {
    mockedGetForm.mockRejectedValue(new FormNotFoundError('nav654321'));

    const response = await request(createApp()).get('/api/employee/forms/nav654321/spec').expect(404);

    expect(response.body.errorCode).toBe('NOT_FOUND');
  });
});
