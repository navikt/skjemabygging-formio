import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormPropertiesType, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { act, renderHook } from '@testing-library/react';
import { Mock, vi } from 'vitest';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import useFormsApiForms from './useFormsApiForms';

vi.mock(import('@navikt/skjemadigitalisering-shared-components'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAppConfig: vi.fn(),
  };
});

vi.mock('../context/notifications/FeedbackContext', () => ({
  useFeedbackEmit: vi.fn(),
}));

const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

const mockLogger = {
  error: vi.fn(),
  debug: vi.fn(),
};

const mockFeedbackEmit = {
  error: vi.fn(),
  success: vi.fn(),
};

const testForm: Form = {
  id: 99,
  revision: 2,
  title: 'Test form',
  path: 'test102030',
  skjemanummer: 'TEST 10-20.30',
  components: [],
  properties: {} as FormPropertiesType,
};

class ConflictError extends Error {
  status = 409;
}

describe('useFormsApiForms', () => {
  beforeEach(() => {
    (useAppConfig as Mock).mockReturnValue({
      http: mockHttp,
      logger: mockLogger,
    });
    (useFeedbackEmit as Mock).mockReturnValue(mockFeedbackEmit);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all forms', async () => {
    const forms: Form[] = [
      { ...testForm, id: 1 },
      { ...testForm, id: 2 },
    ];
    mockHttp.get.mockResolvedValue(forms);

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const fetchedForms = await result.current.getAll();
      expect(fetchedForms).toEqual(forms);
    });

    expect(mockHttp.get).toHaveBeenCalledWith('/api/forms');
  });

  it('should handle error when fetching all forms', async () => {
    const errorMessage = 'Failed to fetch forms';
    mockHttp.get.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      await expect(result.current.getAll()).rejects.toThrow(errorMessage);
    });

    expect(mockHttp.get).toHaveBeenCalledWith('/api/forms');
    expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch forms from /api/forms', { message: errorMessage });
    expect(mockFeedbackEmit.error).toHaveBeenCalledWith(`Feil ved henting av skjemaer. ${errorMessage}`);
  });

  it('should fetch a form by path', async () => {
    mockHttp.get.mockResolvedValue(testForm);

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const fetchedForm = await result.current.get(testForm.path);
      expect(fetchedForm).toEqual(testForm);
    });

    expect(mockHttp.get).toHaveBeenCalledWith(`/api/forms/${testForm.path}`);
  });

  it('should handle error when fetching a form by path', async () => {
    const errorMessage = 'Failed to fetch form';
    mockHttp.get.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const fetchedForm = await result.current.get(testForm.path);
      expect(fetchedForm).toBeUndefined();
    });

    expect(mockHttp.get).toHaveBeenCalledWith(`/api/forms/${testForm.path}`);
    expect(mockLogger.error).toHaveBeenCalledWith(`Failed to fetch form from /api/forms/${testForm.path}`, {
      message: errorMessage,
    });
    expect(mockFeedbackEmit.error).toHaveBeenCalledWith(`Feil ved henting av skjema. ${errorMessage}`);
  });

  it('should create a form', async () => {
    mockHttp.post.mockResolvedValue(testForm);

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const createdForm = await result.current.post(testForm);
      expect(createdForm).toEqual(testForm);
    });

    expect(mockHttp.post).toHaveBeenCalledWith('/api/forms', testForm);
    expect(mockFeedbackEmit.success).toHaveBeenCalledWith(`Opprettet skjema ${testForm.title}`);
  });

  it('should handle errors when creating a form', async () => {
    const errorMessage = 'Failed to create form';
    const testCases = [
      {
        error: new Error(errorMessage),
        expectedMessage: 'Feil ved oppretting av skjema. Failed to create form',
      },
      {
        error: new ConflictError(errorMessage),
        expectedMessage: 'Skjemanummer er allerede i bruk. Velg et annet skjemanummer.',
      },
    ];

    for (const { error, expectedMessage } of testCases) {
      mockHttp.post.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useFormsApiForms());

      await act(async () => {
        const createdForm = await result.current.post(testForm);
        expect(createdForm).toBeUndefined();
      });

      expect(mockHttp.post).toHaveBeenCalledWith('/api/forms', testForm);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create form: /api/forms', { message: errorMessage });
      expect(mockFeedbackEmit.error).toHaveBeenCalledWith(expectedMessage);

      vi.clearAllMocks();
    }
  });

  it('should update a form', async () => {
    mockHttp.put.mockResolvedValue(testForm);

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const updatedForm = await result.current.put(testForm);
      expect(updatedForm).toEqual(testForm);
    });

    expect(mockHttp.put).toHaveBeenCalledWith(`/api/forms/${testForm.path}`, testForm);
    expect(mockFeedbackEmit.success).toHaveBeenCalledWith(`Lagret skjema ${testForm.title}`);
  });

  it('should handle errors when updating a form', async () => {
    const errorMessage = 'Failed to update form';
    const testCases = [
      {
        error: new Error(errorMessage),
        expectedMessage: `Feil ved oppdatering av skjema. ${errorMessage}`,
      },
      {
        error: new ConflictError(errorMessage),
        expectedMessage: 'Skjemaet kan ikke oppdateres akkurat nå. Du kan prøve å laste siden på nytt.',
      },
    ];

    for (const { error, expectedMessage } of testCases) {
      mockHttp.put.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useFormsApiForms());

      await act(async () => {
        const updatedForm = await result.current.put(testForm);
        expect(updatedForm).toBeUndefined();
      });

      expect(mockHttp.put).toHaveBeenCalledWith(`/api/forms/${testForm.path}`, testForm);
      expect(mockLogger.error).toHaveBeenCalledWith(`Failed to update form: /api/forms/${testForm.path}`, {
        message: errorMessage,
      });
      expect(mockFeedbackEmit.error).toHaveBeenCalledWith(expectedMessage);

      vi.clearAllMocks();
    }
  });

  it('should lock a form', async () => {
    const formPath = 'form-1';
    const reason = 'Testing';
    mockHttp.post.mockResolvedValue(testForm);

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const lockedForm = await result.current.postLockForm(formPath, reason);
      expect(lockedForm).toEqual(testForm);
    });

    expect(mockHttp.post).toHaveBeenCalledWith(`/api/forms/${formPath}/lock`, { reason });
    expect(mockFeedbackEmit.success).toHaveBeenCalledWith('Skjemaet ble låst for redigering');
  });

  it('should handle errors when locking a form', async () => {
    const formPath = 'form-1';
    const errorMessage = 'Failed to lock form';

    const expectedMessage = `Feil ved låsing av skjema. ${errorMessage}`;

    mockHttp.post.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const lockedForm = await result.current.postLockForm(formPath, 'Testing');
      expect(lockedForm).toBeUndefined();
    });

    expect(mockHttp.post).toHaveBeenCalledWith(`/api/forms/${formPath}/lock`, { reason: 'Testing' });
    expect(mockLogger.error).toHaveBeenCalledWith(`Failed to lock form: /api/forms/${formPath}/lock`, {
      message: errorMessage,
    });
    expect(mockFeedbackEmit.error).toHaveBeenCalledWith(expectedMessage);
  });

  it('should unlock a form', async () => {
    const formPath = 'form-1';
    mockHttp.delete.mockResolvedValue(testForm);

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const unlockedForm = await result.current.deleteLockForm(formPath);
      expect(unlockedForm).toEqual(testForm);
    });

    expect(mockHttp.delete).toHaveBeenCalledWith(`/api/forms/${formPath}/lock`);
    expect(mockFeedbackEmit.success).toHaveBeenCalledWith('Skjemaet ble åpnet for redigering');
  });

  it('should handle error when unlocking a form', async () => {
    const formPath = 'form-1';
    const errorMessage = 'Failed to unlock form';

    const expectedMessage = `Feil ved opplåsing av skjema. ${errorMessage}`;

    mockHttp.delete.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const unlockedForm = await result.current.deleteLockForm(formPath);
      expect(unlockedForm).toBeUndefined();
    });

    expect(mockHttp.delete).toHaveBeenCalledWith(`/api/forms/${formPath}/lock`);
    expect(mockLogger.error).toHaveBeenCalledWith(`Failed to unlock form: /api/forms/${formPath}/lock`, {
      message: errorMessage,
    });
    expect(mockFeedbackEmit.error).toHaveBeenCalledWith(expectedMessage);
  });

  it('should fetch a published form by path', async () => {
    mockHttp.get.mockResolvedValue(testForm);

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const fetchedForm = await result.current.getPublished(testForm.path);
      expect(fetchedForm).toEqual(testForm);
    });

    expect(mockHttp.get).toHaveBeenCalledWith(`/api/form-publications/${testForm.path}`);
  });

  it('should handle error when fetching a published form by path', async () => {
    const errorMessage = 'Failed to fetch published form';
    mockHttp.get.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const fetchedForm = await result.current.getPublished(testForm.path);
      expect(fetchedForm).toBeUndefined();
    });

    expect(mockHttp.get).toHaveBeenCalledWith(`/api/form-publications/${testForm.path}`);
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Failed to fetch published form from /api/form-publications/${testForm.path}`,
      {
        message: errorMessage,
      },
    );
    expect(mockFeedbackEmit.error).toHaveBeenCalledWith(`Feil ved henting av publisert skjema. ${errorMessage}`);
  });

  it('should publish a form', async () => {
    const languages: TranslationLang[] = ['nb', 'nn'];
    mockHttp.post.mockResolvedValue({ form: testForm, changed: true });

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const publishedForm = await result.current.publish(testForm, languages);
      expect(publishedForm).toEqual(testForm);
    });

    expect(mockHttp.post).toHaveBeenCalledWith(
      `/api/form-publications/${testForm.path}?languageCodes=nb%2Cnn&revision=${testForm.revision}`,
      {},
    );
    expect(mockFeedbackEmit.success).toHaveBeenCalledWith('Satt i gang publisering, dette kan ta noen minutter.');
  });

  it('should handle error when publishing a form', async () => {
    const errorMessage = 'Failed to publish form';
    mockHttp.post.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const publishedForm = await result.current.publish(testForm, ['nb']);
      expect(publishedForm).toBeUndefined();
    });

    expect(mockHttp.post).toHaveBeenCalledWith(
      `/api/form-publications/${testForm.path}?languageCodes=nb&revision=${testForm.revision}`,
      {},
    );
    expect(mockFeedbackEmit.error).toHaveBeenCalledWith(`Publisering av skjema feilet. ${errorMessage}`);
  });

  it('should unpublish a form', async () => {
    mockHttp.delete.mockResolvedValue({ form: testForm });

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const unpublishedForm = await result.current.unpublish(testForm.path);
      expect(unpublishedForm).toEqual(testForm);
    });

    expect(mockHttp.delete).toHaveBeenCalledWith(`/api/form-publications/${testForm.path}`, {});
    expect(mockFeedbackEmit.success).toHaveBeenCalledWith('Satt i gang avpublisering, dette kan ta noen minutter.');
  });

  it('should handle error when unpublishing a form', async () => {
    const errorMessage = 'Failed to unpublish form';
    mockHttp.delete.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useFormsApiForms());

    await act(async () => {
      const unpublishedForm = await result.current.unpublish(testForm.path);
      expect(unpublishedForm).toBeUndefined();
    });

    expect(mockHttp.delete).toHaveBeenCalledWith(`/api/form-publications/${testForm.path}`, {});
    expect(mockFeedbackEmit.error).toHaveBeenCalledWith(`Avpublisering av skjema feilet. ${errorMessage}`);
  });
});
