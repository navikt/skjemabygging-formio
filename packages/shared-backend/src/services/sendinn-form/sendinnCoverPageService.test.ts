import { FormWithLanguages, ResponseError, SendinnCoverPageRequest } from '@navikt/skjemadigitalisering-shared-domain';
import { createSendinnCoverPageService } from './sendinnCoverPageService';
import { createSendinnFormService } from './sendinnFormService';

const pdf = Buffer.from('%PDF-1.4\ncover page fixture\n%%EOF').toString('base64');

const createForm = (): FormWithLanguages => ({
  path: 'nav123456',
  title: 'Source application',
  skjemanummer: 'NAV 12-34.56',
  status: 'published',
  languages: ['nb'],
  properties: {
    skjemanummer: 'NAV 12-34.56',
    tema: 'GEN',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: ['PAPER'],
    hideUserTypes: false,
    enhetstyper: ['LOKAL'],
  },
  components: [
    {
      type: 'attachment',
      key: 'first',
      navId: 'first-id',
      label: 'First document',
      properties: { vedleggskode: 'N1' },
    },
  ],
});

const unidentifiedPerson = {
  userType: 'unidentified-person',
  hasNavContact: 'ja',
  dineOpplysninger: {
    fornavn: 'Test',
    etternavn: 'Person',
    adresse: {
      borDuINorge: 'ja',
      vegadresseEllerPostboksadresse: 'vegadresse',
      adresse: 'Test road',
      postnummer: '0123',
      bySted: 'Oslo',
      land: { value: 'NO', label: 'Norge' },
    },
  },
};

const recipientData = {
  forced: (navUnit: string) => ({ navUnit }),
  multiple: (navUnit: string) => ({ userType: 'multiple-people', navUnit }),
  contact: (navContactUnit: string) => ({ ...unidentifiedPerson, navContactUnit }),
};

describe('createSendinnCoverPageService', () => {
  let form: FormWithLanguages;
  const getSupportedNavUnits = vi.fn();
  const downloadCoverPage = vi.fn();
  const service = createSendinnCoverPageService({
    formService: createSendinnFormService({
      contentService: { getForm: async () => form, getTranslations: vi.fn() },
    }),
    navUnitService: { getNavUnits: vi.fn(), getSupportedNavUnits },
    coverPageService: { downloadCoverPage },
    getAccessToken: async () => 'service-token',
  });
  const request = (data: Record<string, unknown>): SendinnCoverPageRequest => ({
    formPath: 'nav123456',
    language: 'nb',
    attachmentFilter: [],
    submission: {
      data: {
        ...data,
        sendinnAttachment1: {
          first: { attachmentId: 'first-id', navId: 'first-id', type: 'default', value: 'leggerVedNaa', files: [] },
        },
      },
    },
  });

  beforeEach(() => {
    vi.resetAllMocks();
    form = createForm();
    getSupportedNavUnits.mockResolvedValue([
      { enhetId: 1, enhetNr: '0101', navn: 'Local office', type: 'LOKAL' },
      { enhetId: 2, enhetNr: '0202', navn: 'Other office', type: 'HMS' },
    ]);
    downloadCoverPage.mockResolvedValue(pdf);
  });

  it.each(['forced', 'multiple', 'contact'] as const)(
    'validates %s unit membership against the configured unit types',
    async (mode) => {
      form.properties.enhetMaVelgesVedPapirInnsending = mode === 'forced';

      await expect(service.downloadCoverPage(request(recipientData[mode]('0101')))).resolves.toEqual({ pdf });
      expect(downloadCoverPage).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ recipient: { navUnit: '0101' } }) }),
      );

      downloadCoverPage.mockClear();
      await expect(service.downloadCoverPage(request(recipientData[mode]('0202')))).rejects.toMatchObject({
        errorCode: 'BAD_REQUEST',
        message: 'Selected Nav unit is unavailable',
      });
      expect(downloadCoverPage).not.toHaveBeenCalled();
    },
  );

  it('falls back to all units when no unit has a configured type', async () => {
    form.properties.enhetMaVelgesVedPapirInnsending = true;
    form.properties.enhetstyper = ['KLAGE'];

    await expect(service.downloadCoverPage(request({ navUnit: '0202' }))).resolves.toEqual({ pdf });
  });

  it('does not fall back to all units when the unit lookup fails', async () => {
    form.properties.enhetMaVelgesVedPapirInnsending = true;
    getSupportedNavUnits.mockRejectedValue(new ResponseError('SERVICE_UNAVAILABLE', 'Norg2 failed', 'norg2-upstream'));

    await expect(service.downloadCoverPage(request({ navUnit: '0101' }))).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Unable to load Nav units',
      correlationId: 'norg2-upstream',
    });
    expect(downloadCoverPage).not.toHaveBeenCalled();
  });
});
