import {
  convertToSendinnPaperForm,
  Form,
  formsApiTranslationUtils,
  Submission,
  SubmissionAddress,
  SubmissionAttachment,
  SubmissionYourInformation,
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
  land: { value: 'NO', label: 'Norge' },
};
type PersonSubmission = Submission & { data: { dineOpplysninger: SubmissionYourInformation } };

const unidentified = (): PersonSubmission => ({
  data: {
    userType: 'unidentified-person',
    dineOpplysninger: { fornavn: 'Test', etternavn: 'Person', adresse: structuredClone(address) as SubmissionAddress },
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
      attachmentsForArchiving: ['First document'],
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
    const submission = unidentified();
    Object.assign(submission.data, {
      userType: 'identified-person',
      dineOpplysninger: { identitet: { identitetsnummer: '10915596784' }, fornavn: {}, adresse: 'invalid' },
      hasNavContact: 'ja',
      navContactUnit: '9999',
      navUnit: '9999',
    });
    const result = assemble(submission);
    expect(result).toMatchObject({ collection: 'identified-person', user: { nationalIdentityNumber: '10915596784' } });
    const body = coverPageMapper.createRequestBodyFromDownloadData(result);
    expect(body.bruker).toEqual({ brukerId: '10915596784', brukerType: 'PERSON' });
    expect(body).not.toHaveProperty('ukjentBrukerPersoninfo');
    expect(body).not.toHaveProperty('enhetsnummer');
  });

  it('removes a hidden identity before resolving an unidentified person', () => {
    const submission = unidentified();
    Object.assign(submission.data.dineOpplysninger, { identitet: { identitetsnummer: 'invalid-hidden-identity' } });
    expect(assemble(submission).collection).toBe('unidentified-person');
  });

  it.each([
    [
      { hideUserTypes: true, enhetMaVelgesVedPapirInnsending: true },
      { userType: 'identified-person', dineOpplysninger: 'ignored', navUnit: 'ignored' },
      'hidden',
      undefined,
    ],
    [
      { enhetMaVelgesVedPapirInnsending: true },
      { navUnit: '0101', dineOpplysninger: 'ignored' },
      'forced-unit',
      '0101',
    ],
    [
      {},
      { userType: 'multiple-people', navUnit: '0101', dineOpplysninger: 'ignored', navContactUnit: 'ignored' },
      'multiple-people',
      '0101',
    ],
  ] as const)('authorizes no-user only from the trusted configuration/branch %j', (properties, data, reason, unit) => {
    const submission: Submission = { data: {} };
    Object.assign(submission.data, data);
    const result = assemble(submission, properties);
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
    (userType) => {
      expect(() =>
        assemble({ data: { userType, navUnit: '0101' } }, { enhetMaVelgesVedPapirInnsending: true }),
      ).toThrow();
    },
  );

  it.each<Submission['data']>([
    {},
    { userType: 'organization' },
    { userType: 'identified-person' },
    { userType: 'unidentified-person', dineOpplysninger: {} },
    { userType: 'multiple-people' },
  ])('does not turn invalid person/branch answers into no-user success: %j', (data) => {
    expect(() => assemble({ data })).toThrow();
  });

  it('keeps authored order, canonical IDs, translated labels and user descriptions verbatim in both lists', () => {
    const submission = unidentified();
    submission.data.sendinnAttachment2 = { second: attachment('second-id', '  User description  ') };
    submission.data.sendinnAttachment3 = {
      other: [{ ...attachment('other-id', 'Custom other title'), type: 'other' }],
    };
    const result = assemble(submission, {}, ['N3', 'N2', 'N1']);
    expect(result.attachments).toEqual(['Translated first', '  User description  ', 'Custom other title']);
    expect(result.attachmentsForArchiving).toEqual(['First document', '  User description  ', 'Custom other title']);
    expect(assemble(unidentified(), {}, ['N1']).attachments).toEqual(['Translated first']);
  });

  it('allows zero selections in a nonempty available set until T9, but rejects an empty available set', () => {
    expect(assemble({ data: {} }, { hideUserTypes: true }).attachments).toEqual([]);
    expect(() => assemble({ data: {} }, { hideUserTypes: true }, ['unknown'])).toThrow('No attachments are available');
  });

  it('rejects top-level attachment answers', () => {
    const submission = unidentified();
    submission.attachments = [attachment()];
    expect(() => assemble(submission, {}, ['N1'])).toThrow();
  });
});
