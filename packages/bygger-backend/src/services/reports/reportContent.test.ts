import {
  DeclarationType,
  Form,
  FormPropertiesType,
  PublishedTranslations,
  Recipient,
} from '@navikt/skjemadigitalisering-shared-domain';
import { parse } from 'csv-parse/sync';
import MemoryStream from 'memorystream';
import nock from 'nock';
import config from '../../config';
import { formPublicationsService, formsService, recipientService, staticPdfService } from '../index';
import ReportService from '../ReportService';

const legacySummaryHeaders = [
  'skjemanummer',
  'skjematittel',
  'tema',
  'sist publisert',
  'publisert av',
  'upubliserte endringer',
  'sist endret',
  'endret av',
  'submissionTypes',
  'subsequentSubmissionTypes',
  'signaturfelt',
  'path',
  'har vedlegg',
  'antall vedlegg',
  'vedleggsnavn',
  'innsendingsurl',
  'innsendingsurl (papir)',
  'ettersendingsurl',
  'ettersendingsurl (papir)',
];

const createForm = (path: string, properties: Partial<FormPropertiesType> = {}, fields: Partial<Form> = {}): Form => ({
  path,
  title: `Example ${path}`,
  skjemanummer: path,
  components: [],
  properties: {
    skjemanummer: path,
    tema: 'TEST',
    submissionTypes: [],
    subsequentSubmissionTypes: [],
    ...properties,
  },
  ...fields,
});

const createReportService = () =>
  new ReportService({ formsService, formPublicationsService, recipientService, staticPdfService });

const generate = async (id = 'all-forms-summary') => {
  const destination = new MemoryStream(undefined, { readable: false });
  await createReportService().generate(id, destination);
  return {
    records: parse(destination.toString(), { delimiter: ';', columns: true }) as Record<string, string>[],
    rows: parse(destination.toString(), { delimiter: ';' }) as string[][],
  };
};

const mockSummary = (forms: Form[], recipients: Recipient[] = [], withPdfs: string[] = []) => {
  const api = nock(config.formsApi.url)
    .get('/v1/forms')
    .query({ select: 'title,path,properties,status,changedAt,changedBy,publishedAt,publishedBy' })
    .once()
    .reply(
      200,
      forms.map(({ components: _components, introPage: _introPage, ...compact }) => compact),
    )
    .get('/v1/recipients')
    .once()
    .reply(200, recipients);
  for (const form of forms.filter((form) => !form.properties.isTestForm)) {
    api.get(`/v1/forms/${form.path}`).once().reply(200, form);
    api
      .get(`/v1/forms/${form.path}/static-pdfs`)
      .once()
      .reply(200, withPdfs.includes(form.path) ? [{ id: 1, languageCode: 'nb', fileName: 'example.pdf' }] : []);
  }
  return api;
};

describe('Report CSV content and upstream contracts', () => {
  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it('preserves old columns, values and order while appending all stage-one fields', async () => {
    const title = 'Example; "quoted"\nsecond line æøå';
    const declaration = '<p>I confirm; "yes"\nnext line</p>';
    const form = createForm(
      'example',
      {
        declarationType: DeclarationType.custom,
        declarationText: declaration,
        ettersendelsesfrist: '21',
        mottaksadresseId: 'recipient',
        enhetMaVelgesVedPapirInnsending: true,
        descriptionOfSignatures: 'Instructions',
        submissionTypes: ['DIGITAL', 'PAPER', 'DIGITAL_NO_LOGIN', 'STATIC_PDF'],
        subsequentSubmissionTypes: ['DIGITAL', 'PAPER'],
      },
      {
        title,
        status: 'pending',
        publishedAt: '2025-01-01T12:00:00Z',
        publishedBy: 'publisher',
        changedAt: '2025-01-02T12:00:00Z',
        changedBy: 'editor',
        introPage: { enabled: true, introduction: '', selfDeclaration: '', sections: { prerequisites: {} } },
      },
    );
    const api = mockSummary(
      [form],
      [
        {
          recipientId: 'recipient',
          name: 'Example office',
          poBoxAddress: 'Postboks 123',
          postalCode: '0123',
          postalName: 'Oslo',
        },
      ],
      ['example'],
    );
    const { rows, records } = await generate();
    expect(rows[0].slice(0, 19)).toEqual(legacySummaryHeaders);
    expect(rows[1].slice(0, 19)).toEqual([
      'example',
      title,
      'TEST',
      '2025-01-01T12:00:00Z',
      'publisher',
      'ja',
      '2025-01-02T12:00:00Z',
      'editor',
      '["DIGITAL","PAPER","DIGITAL_NO_LOGIN","STATIC_PDF"]',
      '["DIGITAL","PAPER"]',
      '1',
      'example',
      'nei',
      '0',
      '',
      'https://fyllut-preprod.intern.dev.nav.no/fyllut/example',
      'https://fyllut-preprod.intern.dev.nav.no/fyllut/example?sub=paper',
      '',
      '',
    ]);
    expect(records[0]).toMatchObject({
      erklæringstype: 'Tilpasset',
      'tilpasset erklæringstekst': declaration,
      ettersendelsesfrist: '21',
      mottaksadresse: 'Example office, Postboks 123, 0123 Oslo',
      'må velge enhet (papir)': 'ja',
      'generelle instruksjoner': 'ja',
      'introside aktivert': 'ja',
      'innsendingsurl (nologin)': 'https://fyllut-preprod.intern.dev.nav.no/fyllut/example?sub=digitalnologin',
      'har opplastede PDF-er': 'ja',
      'STATIC_PDF aktivert': 'ja',
      'første publiseringsdato': '',
    });
    expect(api.isDone()).toBe(true);
  });

  it('keeps forms without PDFs, separates uploaded PDFs from activation and fetches recipients only once', async () => {
    const forms = [
      createForm('uploaded-only'),
      createForm('enabled-only', { submissionTypes: ['STATIC_PDF'] }),
      createForm('both', { submissionTypes: ['STATIC_PDF'] }),
      createForm('neither'),
      createForm('excluded', { isTestForm: true }),
    ];
    const api = mockSummary(forms, [], ['uploaded-only', 'both']);
    const { records } = await generate();
    expect(records.map((row) => [row.path, row['har opplastede PDF-er'], row['STATIC_PDF aktivert']])).toEqual([
      ['uploaded-only', 'ja', 'nei'],
      ['enabled-only', 'nei', 'ja'],
      ['both', 'ja', 'ja'],
      ['neither', 'nei', 'nei'],
    ]);
    expect(api.isDone()).toBe(true);
  });

  it.each([
    [undefined, 'Ingen'],
    [DeclarationType.none, 'Ingen'],
    [DeclarationType.default, 'Standard'],
    [DeclarationType.custom, 'Tilpasset'],
  ])(
    'maps declaration %s, defaults absent fields and suppresses stale non-custom text',
    async (declarationType, label) => {
      mockSummary([createForm('defaults', { declarationType, declarationText: 'stale text' })]);
      const { records } = await generate();
      expect(records[0]).toMatchObject({
        erklæringstype: label,
        'tilpasset erklæringstekst': declarationType === DeclarationType.custom ? 'stale text' : '',
        ettersendelsesfrist: '',
        mottaksadresse: 'Standard',
        'må velge enhet (papir)': 'nei',
        'generelle instruksjoner': 'nei',
        'introside aktivert': 'nei',
        'innsendingsurl (nologin)': '',
        'første publiseringsdato': '',
      });
    },
  );

  it('handles an empty custom declaration, whitespace instructions and explicitly disabled intro page', async () => {
    mockSummary([
      createForm(
        'empty',
        {
          declarationType: DeclarationType.custom,
          descriptionOfSignatures: ' \n ',
          enhetMaVelgesVedPapirInnsending: false,
        },
        {
          introPage: { enabled: false, introduction: '', selfDeclaration: '', sections: { prerequisites: {} } },
        },
      ),
    ]);
    const { records } = await generate();
    expect(records[0]).toMatchObject({
      'tilpasset erklæringstekst': '',
      'generelle instruksjoner': 'nei',
      'introside aktivert': 'nei',
    });
  });

  it('uses the production nologin URL only for supported submission types', async () => {
    const previous = config.naisClusterName;
    config.naisClusterName = 'prod-gcp';
    try {
      mockSummary([
        createForm('supported', { submissionTypes: ['DIGITAL_NO_LOGIN'] }),
        createForm('unsupported', { submissionTypes: ['DIGITAL'] }),
      ]);
      const { records } = await generate();
      expect(records.map((row) => row['innsendingsurl (nologin)'])).toEqual([
        'https://www.nav.no/fyllut/supported?sub=digitalnologin',
        '',
      ]);
    } finally {
      config.naisClusterName = previous;
    }
  });

  it.each(['metadata', 'recipient', 'missing-recipient', 'detail'])(
    'rejects %s lookup failures instead of reporting absent data',
    async (failure) => {
      const form = createForm('failure', { mottaksadresseId: failure === 'missing-recipient' ? 'missing' : undefined });
      const api = nock(config.formsApi.url).get('/v1/forms').query(true).reply(200, [form]);
      api.get('/v1/recipients').reply(failure === 'recipient' ? 503 : 200, failure === 'recipient' ? {} : []);
      if (failure !== 'recipient') {
        api.get('/v1/forms/failure').reply(failure === 'detail' ? 503 : 200, form);
        if (failure !== 'detail') {
          api.get('/v1/forms/failure/static-pdfs').reply(failure === 'metadata' ? 503 : 200, []);
        }
      }
      await expect(generate()).rejects.toThrow();
      expect(api.isDone()).toBe(true);
    },
  );

  it('returns only headers for empty reports', async () => {
    const api = mockSummary([]);
    const { records, rows } = await generate();
    expect(records).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0].slice(0, 19)).toEqual(legacySummaryHeaders);
    expect(api.isDone()).toBe(true);
  });

  it('uses the actual published title translation key and leaves unpublished languages blank', async () => {
    const title = 'Application; "original"\nTitle';
    const forms = [
      createForm('translated', {}, { title }),
      createForm('fallback'),
      createForm('excluded', { isTestForm: true }),
    ];
    const api = nock(config.formsApi.url).get('/v1/form-publications').once().reply(200, forms);
    for (const form of forms.filter((form) => !form.properties.isTestForm)) {
      api.get(`/v1/form-publications/${form.path}`).once().reply(200, form);
    }
    const translations: PublishedTranslations = {
      publishedAt: '2025-01-01',
      publishedBy: 'publisher',
      translations: { nb: { [title]: 'Bokmål tittel' }, en: { [title]: 'English; "title"\nsecond line' } },
    };
    api
      .get('/v1/form-publications/translated/translations')
      .query({ languageCodes: 'nb,nn,en' })
      .once()
      .reply(200, translations);
    api
      .get('/v1/form-publications/fallback/translations')
      .query({ languageCodes: 'nb,nn,en' })
      .once()
      .reply(200, {
        ...translations,
        translations: { nb: {}, nn: { 'Example fallback': 'Nynorsk tittel' }, en: {} },
      });
    const { records, rows } = await generate('forms-published-languages');
    expect(rows[0]).toEqual([
      'skjemanummer',
      'skjematittel',
      'språk',
      'skjematittel (nb)',
      'skjematittel (nn)',
      'skjematittel (en)',
    ]);
    expect(records).toEqual([
      {
        skjemanummer: 'translated',
        skjematittel: title,
        språk: 'nb,en',
        'skjematittel (nb)': 'Bokmål tittel',
        'skjematittel (nn)': '',
        'skjematittel (en)': 'English; "title"\nsecond line',
      },
      {
        skjemanummer: 'fallback',
        skjematittel: 'Example fallback',
        språk: 'nb,nn,en',
        'skjematittel (nb)': 'Example fallback',
        'skjematittel (nn)': 'Nynorsk tittel',
        'skjematittel (en)': 'Example fallback',
      },
    ]);
    expect(api.isDone()).toBe(true);
  });

  it('propagates published translation lookup failures', async () => {
    nock(config.formsApi.url)
      .get('/v1/form-publications')
      .reply(200, [createForm('example')])
      .get('/v1/form-publications/example')
      .reply(200, createForm('example'))
      .get('/v1/form-publications/example/translations')
      .query(true)
      .reply(503);
    await expect(generate('forms-published-languages')).rejects.toThrow();
  });

  it('uses the published title rather than a renamed pending draft for language titles', async () => {
    const api = nock(config.formsApi.url)
      .get('/v1/form-publications')
      .reply(200, [createForm('pending', {}, { title: 'Draft title', status: 'pending' })])
      .get('/v1/form-publications/pending')
      .reply(200, createForm('pending', {}, { title: 'Published title', status: 'published' }))
      .get('/v1/form-publications/pending/translations')
      .query({ languageCodes: 'nb,nn,en' })
      .reply(200, {
        translations: { nb: {}, en: { 'Published title': 'English published title', 'Draft title': 'Wrong title' } },
      });
    const { records } = await generate('forms-published-languages');
    expect(records[0]).toMatchObject({
      skjematittel: 'Draft title',
      'skjematittel (nb)': 'Published title',
      'skjematittel (nn)': '',
      'skjematittel (en)': 'English published title',
    });
    expect(api.isDone()).toBe(true);
  });

  it('preserves unpublished report filtering and columns', async () => {
    nock(config.formsApi.url)
      .get('/v1/forms')
      .query({ select: 'skjemanummer,title,status,publishedAt,publishedBy,properties' })
      .reply(200, [
        createForm('unpublished', {}, { status: 'unpublished', publishedAt: '2025-01-01', publishedBy: 'publisher' }),
        createForm('published', {}, { status: 'published' }),
        createForm('draft', {}, { status: 'draft' }),
        createForm('excluded', { isTestForm: true }, { status: 'unpublished' }),
      ]);
    expect((await generate('unpublished-forms')).rows).toEqual([
      ['skjemanummer', 'skjematittel', 'avpublisert', 'avpublisert av'],
      ['unpublished', 'Example unpublished', '2025-01-01', 'publisher'],
    ]);
  });

  it('preserves one row per attachment with CSV escaping and ignores test forms', async () => {
    const form = createForm(
      'attachments',
      {},
      {
        components: [
          {
            type: 'panel',
            key: 'attachments',
            label: 'Attachments',
            isAttachmentPanel: true,
            components: [
              {
                type: 'attachment',
                key: 'one',
                label: 'Label; "one"\nnext',
                properties: { vedleggstittel: 'Title; "one"', vedleggskode: 'A1' },
              },
              {
                type: 'attachment',
                key: 'two',
                label: 'Label two',
                properties: { vedleggstittel: 'Title two', vedleggskode: 'A2' },
              },
            ],
          },
        ],
      },
    );
    const empty = createForm('empty');
    const api = nock(config.formsApi.url)
      .get('/v1/forms')
      .query({ select: 'path,title,skjemanummer,properties' })
      .reply(200, [form, empty, createForm('excluded', { isTestForm: true })])
      .get('/v1/forms/attachments')
      .once()
      .reply(200, form)
      .get('/v1/forms/empty')
      .once()
      .reply(200, empty);
    expect((await generate('all-forms-and-attachments')).rows).toEqual([
      ['skjemanummer', 'skjematittel', 'vedleggstittel', 'vedleggskode', 'label'],
      ['attachments', 'Example attachments', 'Title; "one"', 'A1', 'Label; "one"\nnext'],
      ['attachments', 'Example attachments', 'Title two', 'A2', 'Label two'],
    ]);
    expect(api.isDone()).toBe(true);
  });
});
