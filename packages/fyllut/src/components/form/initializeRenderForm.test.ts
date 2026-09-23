import { Form, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import {
  applyPrefillDataToForm,
  findUnsupportedCustomValidation,
  getFormPrefillKeys,
  initializeDigitalDraft,
  resolveDefaultSubmissionMethod,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RenderFormBootstrapService } from '../../adapter-services/createRenderFormBootstrapService';
import { initializeRenderForm } from './initializeRenderForm';

vi.mock('@navikt/skjemadigitalisering-shared-frontend', () => ({
  applyPrefillDataToForm: vi.fn(),
  findUnsupportedCustomValidation: vi.fn(),
  getFormPrefillKeys: vi.fn(),
  initializeDigitalDraft: vi.fn(),
  resolveDefaultSubmissionMethod: vi.fn(),
}));

const form: Form = {
  path: 'test-form',
  title: 'Test form',
  skjemanummer: 'TEST',
  components: [],
  properties: {
    skjemanummer: 'TEST',
    tema: 'GEN',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: [],
  },
};

const setup = () => {
  const bootstrapService: RenderFormBootstrapService = {
    load: vi.fn().mockResolvedValue({ form, translations: {} }),
    getPrefillData: vi.fn().mockResolvedValue({}),
  };
  const applications: RuntimeServices['applications'] = {
    getActiveTasks: vi.fn(),
    getDraft: vi.fn(),
    createDraft: vi.fn(),
    updateDraft: vi.fn(),
    deleteDraft: vi.fn(),
  };
  const initialize = () =>
    initializeRenderForm({
      formPath: form.path,
      routePath: 'first-page',
      search: '?sub=digital&innsendingsId=draft-id',
      submissionMethod: 'digital',
      bootstrapService,
      applications,
      loadKey: 'load-key',
    });
  return { bootstrapService, initialize };
};

describe('initializeRenderForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(applyPrefillDataToForm).mockImplementation((form) => form);
    vi.mocked(findUnsupportedCustomValidation).mockReturnValue([]);
    vi.mocked(getFormPrefillKeys).mockReturnValue([]);
    vi.mocked(initializeDigitalDraft).mockResolvedValue({ type: 'ready' });
    vi.mocked(resolveDefaultSubmissionMethod).mockReturnValue('digital');
  });

  it('initializes the form with its loaded draft', async () => {
    const { initialize } = setup();
    const draft = {
      initialInnsendingsId: 'draft-id',
      initialLanguage: 'en' as const,
      initialSubmission: { data: { answer: 'Saved answer' } },
    };
    vi.mocked(initializeDigitalDraft).mockResolvedValue({ type: 'ready', ...draft });

    await expect(initialize()).resolves.toEqual({
      type: 'ready',
      initializedForm: { form, translations: {}, loadKey: 'load-key', ...draft },
    });
  });

  it('reports a missing form without prefill or draft side effects', async () => {
    const { bootstrapService, initialize } = setup();
    vi.mocked(bootstrapService.load).mockResolvedValue(undefined);

    await expect(initialize()).resolves.toEqual({ type: 'notFound' });
    expect(bootstrapService.getPrefillData).not.toHaveBeenCalled();
    expect(initializeDigitalDraft).not.toHaveBeenCalled();
  });

  it('propagates bootstrap failures instead of reporting a missing form', async () => {
    const { bootstrapService, initialize } = setup();
    const error = new ResponseError('SERVICE_UNAVAILABLE', 'Bootstrap unavailable');
    vi.mocked(bootstrapService.load).mockRejectedValue(error);

    await expect(initialize()).rejects.toBe(error);
    expect(initializeDigitalDraft).not.toHaveBeenCalled();
  });

  it('propagates prefill failures, including NOT_FOUND, without starting a draft', async () => {
    const { bootstrapService, initialize } = setup();
    const error = new ResponseError('NOT_FOUND', 'Prefill unavailable');
    vi.mocked(getFormPrefillKeys).mockReturnValue(['name']);
    vi.mocked(bootstrapService.getPrefillData).mockRejectedValue(error);

    await expect(initialize()).rejects.toBe(error);
    expect(bootstrapService.getPrefillData).toHaveBeenCalledWith(['name']);
    expect(initializeDigitalDraft).not.toHaveBeenCalled();
  });

  it.each([
    new ResponseError('SERVICE_UNAVAILABLE', 'Draft service unavailable'),
    new ResponseError('NOT_FOUND', 'Draft creation endpoint unavailable'),
    new ResponseError('UNAUTHORIZED', 'Authentication required'),
    new TypeError('Failed to fetch'),
  ])('propagates draft initialization failures: %s', async (error) => {
    const { initialize } = setup();
    vi.mocked(initializeDigitalDraft).mockRejectedValue(error);

    await expect(initialize()).rejects.toBe(error);
  });

  it('keeps a missing saved draft distinct from a missing form', async () => {
    const { initialize } = setup();
    vi.mocked(initializeDigitalDraft).mockResolvedValue({ type: 'notFound' });

    await expect(initialize()).resolves.toEqual({ type: 'draftNotFound' });
  });

  it('preserves draft redirects', async () => {
    const { initialize } = setup();
    const redirect = { type: 'redirect' as const, search: '?sub=digital&innsendingsId=created-draft' };
    vi.mocked(initializeDigitalDraft).mockResolvedValue(redirect);

    await expect(initialize()).resolves.toEqual(redirect);
  });

  it('preserves legacy fallback before any prefill or draft side effects', async () => {
    const { bootstrapService, initialize } = setup();
    const unsupportedCustomValidation = [
      { componentKey: 'field', componentType: 'textfield', script: 'valid = false;' },
    ];
    vi.mocked(findUnsupportedCustomValidation).mockReturnValue(unsupportedCustomValidation);

    await expect(initialize()).resolves.toEqual({ type: 'unsupportedByRenderer', unsupportedCustomValidation });
    expect(bootstrapService.getPrefillData).not.toHaveBeenCalled();
    expect(initializeDigitalDraft).not.toHaveBeenCalled();
  });
});
