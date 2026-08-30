import { Form, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationService } from '../../context/runtime-services/RuntimeServicesContext';
import { initializeDigitalDraft } from './initializeDigitalDraft';

const form: Form = {
  skjemanummer: 'NAV 12-34.56',
  path: 'test-form',
  title: 'Test form',
  components: [],
  properties: {
    skjemanummer: 'NAV 12-34.56',
    tema: 'GEN',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: [],
  },
};

const createApplicationService = (): ApplicationService => ({
  getActiveTasks: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  updateDraft: vi.fn(),
  deleteDraft: vi.fn(),
});

describe('initializeDigitalDraft', () => {
  it('does not load or create drafts for other submission methods', async () => {
    const applications = createApplicationService();

    await expect(
      initializeDigitalDraft({ applications, form, search: '?sub=paper', submissionMethod: 'paper' }),
    ).resolves.toEqual({ type: 'ready' });
    expect(applications.getDraft).not.toHaveBeenCalled();
    expect(applications.createDraft).not.toHaveBeenCalled();
  });

  it('loads an existing draft and adds persistence metadata', async () => {
    const applications = createApplicationService();
    vi.mocked(applications.getDraft).mockResolvedValue({
      id: 'draft-123',
      language: 'en',
      submission: { data: {} },
      modifiedAt: '2026-08-27T10:00:00Z',
      deleteAt: '2026-09-24T10:00:00Z',
    });

    const result = await initializeDigitalDraft({
      applications,
      form,
      search: '?sub=digital&innsendingsId=draft-123',
      submissionMethod: 'digital',
    });

    expect(result).toMatchObject({
      type: 'ready',
      initialInnsendingsId: 'draft-123',
      initialLanguage: 'en',
      initialSubmission: {
        data: {},
        fyllutState: { mellomlagring: { isActive: true } },
      },
    });
  });

  it('keeps every populated data grid row when an earlier row was saved empty', async () => {
    const applications = createApplicationService();
    const formWithDataGrid: Form = {
      ...form,
      components: [
        {
          key: 'panel',
          title: 'Panel',
          type: 'panel',
          navId: 'panel',
          components: [
            {
              key: 'kjoreliste',
              label: 'Kjøreliste',
              type: 'datagrid',
              input: true,
              tree: true,
              navId: 'grid',
              components: [{ key: 'dato', label: 'Dato', type: 'textfield', input: true, navId: 'dato' }],
            },
          ],
        },
      ],
    } as unknown as Form;
    vi.mocked(applications.getDraft).mockResolvedValue({
      id: 'draft-123',
      language: 'nb',
      submission: { data: { kjoreliste: [null, { dato: '01.01.2026' }] } },
      modifiedAt: '2026-08-27T10:00:00Z',
      deleteAt: '2026-09-24T10:00:00Z',
    });

    const result = await initializeDigitalDraft({
      applications,
      form: formWithDataGrid,
      search: '?sub=digital&innsendingsId=draft-123',
      submissionMethod: 'digital',
    });

    expect(result).toMatchObject({
      type: 'ready',
      initialSubmission: { data: { kjoreliste: [{}, { dato: '01.01.2026' }] } },
    });
  });

  it('keeps answers for digital-only components when loading a draft', async () => {
    const applications = createApplicationService();
    const formWithDigitalOnlyComponent: Form = {
      ...form,
      properties: { ...form.properties, submissionTypes: ['PAPER', 'DIGITAL'] },
      components: [
        {
          key: 'panel',
          title: 'Panel',
          type: 'panel',
          navId: 'panel',
          components: [
            {
              key: 'jegSokerPaVegneAvMegSelv',
              label: 'Jeg søker på vegne av meg selv',
              type: 'navCheckbox',
              input: true,
              navId: 'digitalOnly',
              customConditional: 'show = instance.isSubmissionDigital();',
            },
          ],
        },
      ],
    } as unknown as Form;
    vi.mocked(applications.getDraft).mockResolvedValue({
      id: 'draft-123',
      language: 'nb',
      submission: { data: { jegSokerPaVegneAvMegSelv: true } },
      modifiedAt: '2026-08-27T10:00:00Z',
      deleteAt: '2026-09-24T10:00:00Z',
    });

    const result = await initializeDigitalDraft({
      applications,
      form: formWithDigitalOnlyComponent,
      search: '?sub=digital&innsendingsId=draft-123',
      submissionMethod: 'digital',
    });

    expect(result).toMatchObject({
      type: 'ready',
      initialSubmission: { data: { jegSokerPaVegneAvMegSelv: true } },
    });
  });

  it('returns notFound when the requested draft does not exist', async () => {
    const applications = createApplicationService();
    vi.mocked(applications.getDraft).mockRejectedValue(new ResponseError('NOT_FOUND', 'Draft not found'));

    await expect(
      initializeDigitalDraft({
        applications,
        form,
        search: '?sub=digital&innsendingsId=missing',
        submissionMethod: 'digital',
      }),
    ).resolves.toEqual({ type: 'notFound' });
  });

  it('creates a draft and redirects to its canonical URL', async () => {
    const applications = createApplicationService();
    vi.mocked(applications.createDraft).mockResolvedValue({
      status: 'created',
      draft: {
        id: 'draft-123',
        language: 'en',
        submission: { data: {} },
        modifiedAt: '2026-08-27T10:00:00Z',
        deleteAt: '2026-09-24T10:00:00Z',
      },
    });

    await expect(
      initializeDigitalDraft({
        applications,
        form,
        search: '?sub=digital&lang=en&forceMellomlagring=true',
        submissionMethod: 'digital',
      }),
    ).resolves.toEqual({
      type: 'redirect',
      search: '?sub=digital&lang=en&innsendingsId=draft-123',
    });
    expect(applications.createDraft).toHaveBeenCalledWith({
      formPath: 'test-form',
      submission: { data: {} },
      language: 'en',
      submissionMethod: 'digital',
      force: true,
    });
  });
});
