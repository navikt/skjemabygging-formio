import {
  convertToSendinnPaperForm,
  Form,
  formsApiTranslationUtils,
  Submission,
  SubmissionAttachment,
} from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageMapper } from './mapper';
import { createSubsequentSubmissionDownloadData } from './subsequentSubmission';

const source: Form = {
  path: 'nav123456',
  title: 'Source application',
  skjemanummer: 'NAV 12-34.56',
  properties: {
    skjemanummer: 'NAV 12-34.56',
    tema: 'GEN',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: ['PAPER'],
  },
  components: [
    {
      type: 'container',
      key: 'originalScope',
      label: '',
      components: [
        {
          type: 'attachment',
          key: 'first',
          navId: 'first-id',
          label: 'First document',
          properties: { vedleggskode: 'N1' },
        },
        {
          type: 'attachment',
          key: 'second',
          navId: 'second-id',
          label: 'Second document',
          properties: { vedleggskode: 'N2' },
        },
        {
          type: 'attachment',
          key: 'other',
          navId: 'other-id',
          label: 'Other document',
          otherDocumentation: true,
          properties: { vedleggskode: 'N3' },
        },
      ],
    },
  ],
};

const attachment = (navId = 'first-id', title?: string): SubmissionAttachment => ({
  attachmentId: navId,
  navId,
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
  ...(title === undefined ? {} : { title }),
});
const address = {
  borDuINorge: 'ja',
  vegadresseEllerPostboksadresse: 'vegadresse',
  adresse: 'Test road 1',
  postnummer: '0123',
  bySted: 'Oslo',
  landkode: 'NO',
  land: { value: 'NO', label: 'Norge' },
};
const unidentified = (): Submission => ({
  data: {
    collectionType: 'unidentified-person',
    yourInformation: { fornavn: 'Test', etternavn: 'Person', adresse: structuredClone(address) },
    hasNavContact: 'nei',
    sendinnAttachment1: { first: attachment() },
  },
});
const assemble = (submission: Submission, properties: Partial<Form['properties']> = {}, filter: string[] = []) =>
  createSubsequentSubmissionDownloadData({
    form: convertToSendinnPaperForm(
      { ...source, properties: { ...source.properties, ...properties } },
      { attachmentFilter: filter },
    ),
    submission,
    language: 'en',
    allowTestIdentityNumbers: true,
    translate: formsApiTranslationUtils.createTranslate({ 'First document': { en: 'Translated first' } }, 'en'),
  });

describe('trusted subsequent submission assembly', () => {
  it('uses the concerned person, not a supplied actor or legacy flat identity, and omits the SKJEMA prefix from document lists', () => {
    const submission = unidentified();
    Object.assign(submission.data, {
      fodselsnummerDNummerSoker: 'invalid-legacy-identity',
      fornavnAvsender: 'Hidden actor',
      etternavnAvsender: 'Hidden actor',
      navUnit: '9999',
      navContactUnit: '9999',
    });
    const result = assemble(submission);
    expect(result).toMatchObject({
      type: 'ETTERSENDELSE',
      collection: 'unidentified-person',
      user: { firstName: 'Test', surname: 'Person' },
      attachments: ['Translated first'],
      archivedAttachments: ['First document'],
    });
    const body = coverPageMapper.createRequestBodyFromDownloadData(result, 'en');
    expect(body).toMatchObject({
      foerstesidetype: 'ETTERSENDELSE',
      spraakkode: 'EN',
      dokumentlisteFoersteside: ['Translated first'],
      vedleggsliste: ['First document'],
      netsPostboks: '1400',
    });
    expect(body).not.toHaveProperty('bruker');
    expect(body).not.toHaveProperty('enhetsnummer');
    expect(body.ukjentBrukerPersoninfo).toBe('Test Person, Test road 1, 0123 Oslo, Norge');
  });

  it('resolves canonical identity and discards inactive name/address/contact answers', () => {
    const submission: Submission = {
      data: {
        collectionType: 'identified-person',
        yourInformation: { identitet: { identitetsnummer: '10915596784' }, fornavn: {}, adresse: 'invalid' },
        hasNavContact: 'ja',
        navContactUnit: '9999',
        navUnit: '9999',
        sendinnAttachment1: { first: attachment() },
      },
    };
    const result = assemble(submission);
    expect(result).toMatchObject({ collection: 'identified-person', user: { nationalIdentityNumber: '10915596784' } });
    const body = coverPageMapper.createRequestBodyFromDownloadData(result);
    expect(body.bruker).toEqual({ brukerId: '10915596784', brukerType: 'PERSON' });
    expect(body).not.toHaveProperty('ukjentBrukerPersoninfo');
    expect(body).not.toHaveProperty('enhetsnummer');
  });

  it('removes a hidden identity before resolving an unidentified person', () => {
    const submission = unidentified();
    Object.assign(submission.data.yourInformation, { identitet: { identitetsnummer: 'invalid-hidden-identity' } });
    expect(assemble(submission).collection).toBe('unidentified-person');
  });

  it.each([
    [
      { hideUserTypes: true, enhetMaVelgesVedPapirInnsending: true },
      { collectionType: 'identified-person', yourInformation: 'ignored', navUnit: 'ignored' },
      'hidden',
      undefined,
    ],
    [{ enhetMaVelgesVedPapirInnsending: true }, { navUnit: '0101', yourInformation: 'ignored' }, 'forced-unit', '0101'],
    [
      {},
      { collectionType: 'multiple-people', navUnit: '0101', yourInformation: 'ignored', navContactUnit: 'ignored' },
      'multiple-people',
      '0101',
    ],
  ] as const)('authorizes no-user only from the trusted configuration/branch %j', (properties, data, reason, unit) => {
    const result = assemble({ data: { ...data, sendinnAttachment1: { first: attachment() } } }, properties);
    expect(result).toMatchObject({ collection: 'authorized-no-user', reason });
    expect(result).not.toHaveProperty('user');
    const body = coverPageMapper.createRequestBodyFromDownloadData(result);
    expect(body).not.toHaveProperty('bruker');
    expect(body).not.toHaveProperty('ukjentBrukerPersoninfo');
    expect(body.netsPostboks).toBe('1400');
    expect(body.enhetsnummer).toBe(unit);
    expect(body).not.toHaveProperty('adresse');
  });

  it.each(['identified-person', 'unidentified-person', 'multiple-people'])(
    'rejects a branch choice in forced mode: %s',
    (collectionType) => {
      expect(() =>
        assemble(
          { data: { collectionType, navUnit: '0101', sendinnAttachment1: { first: attachment() } } },
          { enhetMaVelgesVedPapirInnsending: true },
        ),
      ).toThrow();
    },
  );

  it.each<Submission['data']>([
    {},
    { collectionType: 'organization' },
    { collectionType: 'identified-person' },
    { collectionType: 'identified-person', yourInformation: { identitet: { identitetsnummer: 'invalid' } } },
    { collectionType: 'unidentified-person', yourInformation: {} },
    { collectionType: 'multiple-people' },
  ])('does not turn invalid person/branch answers into no-user success: %j', (data) => {
    expect(() => assemble({ data: { ...data, sendinnAttachment1: { first: attachment() } } })).toThrow();
  });

  it.each([
    (submission: Submission) => {
      Object.assign(submission.data.yourInformation, { fornavn: '' });
    },
    (submission: Submission) => {
      Object.assign(submission.data.yourInformation, { etternavn: '<invalid>' });
    },
    (submission: Submission) => {
      Object.assign(submission.data.yourInformation, { adresse: {} });
    },
    (submission: Submission) => {
      Object.assign(submission.data.yourInformation, { adresse: { ...address, postnummer: 'abc' } });
    },
    (submission: Submission) => {
      Object.assign(submission.data.yourInformation, { adresse: { ...address, borDuINorge: 'other' } });
    },
    (submission: Submission) => {
      submission.data.hasNavContact = 'ja';
    },
    (submission: Submission) => {
      submission.data.hasNavContact = 'unknown';
    },
  ])('rejects invalid active person/contact fields with a safe standard error', (mutate) => {
    const submission = unidentified();
    mutate(submission);
    expect(() => assemble(submission)).toThrow('Invalid cover page answers');
  });

  it('uses the active address branch for foreign and post-office-box users', () => {
    const submission = unidentified();
    Object.assign(submission.data.yourInformation, {
      adresse: {
        ...address,
        borDuINorge: 'nei',
        adresse: 'Foreign road',
        postnummer: '',
        bySted: '',
        landkode: 'SE',
        land: { value: 'SE', label: 'Sverige' },
        postboks: 'stale',
      },
    });
    expect(assemble(submission).user).toMatchObject({
      address: { country: { value: 'SE' }, streetAddress: 'Foreign road' },
    });
    Object.assign(submission.data.yourInformation, {
      adresse: {
        ...address,
        vegadresseEllerPostboksadresse: 'postboksadresse',
        postboks: '123',
        adresse: 'stale',
      },
    });
    const body = coverPageMapper.createRequestBodyFromDownloadData(assemble(submission));
    expect(body.ukjentBrukerPersoninfo).toContain('Postboks 123');
    expect(body.ukjentBrukerPersoninfo).not.toContain('stale');
  });

  it('ignores malformed inactive address fields without affecting the active concerned person', () => {
    const submission = unidentified();
    Object.assign(submission.data.yourInformation, {
      adresse: {
        ...address,
        postboks: { ignored: true },
        region: '<inactive>',
        land: '<inactive>',
        landkode: '<inactive>',
      },
    });
    const body = coverPageMapper.createRequestBodyFromDownloadData(assemble(submission));
    expect(body.ukjentBrukerPersoninfo).toBe('Test Person, Test road 1, 0123 Oslo, Norge');
  });

  it('keeps authored order, canonical IDs, translated labels and user descriptions verbatim in both lists', () => {
    const submission = unidentified();
    submission.data.sendinnAttachment2 = { second: attachment('second-id', '  User description  ') };
    submission.data.sendinnAttachment3 = {
      other: [{ ...attachment('other-id', 'Custom other title'), type: 'other' }],
    };
    const result = assemble(submission, {}, ['N3', 'N2', 'N1']);
    expect(result.attachments).toEqual(['Translated first', '  User description  ', 'Custom other title']);
    expect(result.archivedAttachments).toEqual(['First document', '  User description  ', 'Custom other title']);
    expect(assemble(unidentified(), {}, ['N1']).attachments).toEqual(['Translated first']);
  });

  it('rejects zero selections separately from an empty available set', () => {
    expect(() => assemble({ data: {} }, { hideUserTypes: true })).toThrow(
      'At least one available attachment must be selected',
    );
    expect(() => assemble({ data: {} }, { hideUserTypes: true }, ['unknown'])).toThrow('No attachments are available');
  });

  it.each([
    [{ hideUserTypes: true }, {}],
    [{ enhetMaVelgesVedPapirInnsending: true }, { navUnit: '0101' }],
    [{}, { collectionType: 'multiple-people', navUnit: '0101' }],
    [{}, { collectionType: 'identified-person', yourInformation: { identitet: { identitetsnummer: '10915596784' } } }],
    [{}, Object.fromEntries(Object.entries(unidentified().data).filter(([key]) => key !== 'sendinnAttachment1'))],
  ])('requires selection in every authorized collection mode %j', (properties, data) => {
    expect(() => assemble({ data }, properties)).toThrow('At least one available attachment must be selected');
  });

  it('accepts a later available document alone and does not count unselected records', () => {
    const submission: Submission = {
      data: {
        sendinnAttachment1: { first: { ...attachment(), value: '' } },
        sendinnAttachment2: { second: attachment('second-id') },
      },
    };
    expect(assemble(submission, { hideUserTypes: true }).attachments).toEqual(['Second document']);
    delete submission.data.sendinnAttachment2;
    expect(() => assemble(submission, { hideUserTypes: true })).toThrow(
      'At least one available attachment must be selected',
    );
  });

  it.each([
    (submission: Submission) => {
      submission.data.sendinnAttachment99 = { unknown: attachment('unknown') };
    },
    (submission: Submission) => {
      submission.data.sendinnAttachment2 = { second: attachment('second-id') };
    },
    (submission: Submission) => {
      submission.data.sendinnAttachment1 = { first: attachment('unknown') };
    },
    (submission: Submission) => {
      submission.attachments = [attachment()];
    },
  ])('rejects selections outside the current filtered definitions', (mutate) => {
    const submission = unidentified();
    mutate(submission);
    expect(() => assemble(submission, {}, ['N1'])).toThrow();
  });

  it.each(['', 'a'.repeat(51), '<invalid>'])('enforces shared other-document title rules for %s', (title) => {
    const submission = unidentified();
    submission.data.sendinnAttachment3 = { other: [{ ...attachment('other-id', title), type: 'other' }] };
    expect(() => assemble(submission)).toThrow('Invalid cover page answers');
  });

  it('accepts 50 characters and rejects uploads, duplicate other documents and unsupported choices', () => {
    const submission = unidentified();
    const other = { ...attachment('other-id', 'a'.repeat(50)), type: 'other' as const };
    submission.data.sendinnAttachment3 = { other: [other] };
    expect(assemble(submission).attachments.at(-1)).toBe('a'.repeat(50));
    submission.data.sendinnAttachment3 = { other: [{ ...other, title: '   ' }] };
    expect(assemble(submission).attachments.at(-1)).toBe('   ');
    expect(assemble(submission).archivedAttachments?.at(-1)).toBe('   ');
    submission.data.sendinnAttachment3 = { other: [other, other] };
    expect(() => assemble(submission)).toThrow();
    submission.data.sendinnAttachment3 = { other: [{ ...other, value: 'ettersender' }] };
    expect(() => assemble(submission)).toThrow();
    submission.data.sendinnAttachment3 = { other: [] };
    submission.data.sendinnAttachment1 = { first: { ...attachment(), files: [{ fileId: 'not-paper' }] } };
    expect(() => assemble(submission)).toThrow();
  });
});
