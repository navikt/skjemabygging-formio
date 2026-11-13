import {
  convertToSendinnPaperForm,
  CoverPageDownloadType,
  Form,
  Recipient,
  Submission,
  SubmissionAddress,
  SubmissionAttachment,
  SubmissionYourInformation,
} from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageMapper } from '../cover-page';
import { createSendinnCoverPageService } from './sendinnCoverPageService';

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
const assemble = async (
  submission: Submission,
  properties: Partial<Form['properties']> = {},
  filter: string[] = [],
  recipient?: Recipient,
) => {
  const form = convertToSendinnPaperForm(
    { ...source, properties: { ...source.properties, ...properties } },
    { attachmentFilter: filter },
  );
  let data: CoverPageDownloadType | undefined;
  const service = createSendinnCoverPageService({
    formService: {
      getForm: async () => ({
        form,
        languages: ['nb', 'en'],
        language: 'en',
        translations: { 'First document': { en: 'Translated first' } },
        attachmentFilter: filter,
      }),
    },
    coverPageService: {
      downloadCoverPage: async (props) => {
        data = props.data;
        return 'pdf';
      },
    },
    recipientService: {
      getRecipient: async ({ recipientId }) => (recipientId === recipient?.recipientId ? recipient : undefined),
    },
    getAccessToken: async () => 'token',
  });
  await service.downloadCoverPage({
    formPath: source.path,
    revision: 1,
    language: 'en',
    attachmentFilter: filter,
    submission,
  });
  return data!;
};

describe('createSendinnCoverPageService', () => {
  it('sends an unidentified person as unknown user info and omits the SKJEMA prefix from document lists', async () => {
    const result = await assemble(unidentified());
    expect(result).toMatchObject({
      type: 'ETTERSENDELSE',
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

  it('sends only the national identity number of an identified person', async () => {
    const submission: Submission = {
      data: { userType: 'identified-person', dineOpplysninger: { identitet: { identitetsnummer: '10915596784' } } },
    };
    const result = await assemble(submission);
    expect(result.user).toEqual({ nationalIdentityNumber: '10915596784' });
    const body = coverPageMapper.createRequestBodyFromDownloadData(result);
    expect(body.bruker).toEqual({ brukerId: '10915596784', brukerType: 'PERSON' });
    expect(body).not.toHaveProperty('ukjentBrukerPersoninfo');
    expect(body).not.toHaveProperty('enhetsnummer');
  });

  it('sends the Nav contact unit chosen by an unidentified person', async () => {
    const submission = unidentified();
    Object.assign(submission.data, { hasNavContact: 'ja', navContactUnit: '0101' });
    const result = await assemble(submission);
    expect(result.user).toMatchObject({ firstName: 'Test', surname: 'Person' });
    expect(result.recipient).toEqual({ navUnit: '0101' });
  });

  it('sends to the form recipient instead of the chosen Nav unit', async () => {
    const recipient: Recipient = {
      recipientId: 'recipient-id',
      name: 'Nav Test',
      poBoxAddress: '1234',
      postalCode: '0101',
      postalName: 'Oslo',
    };
    const result = await assemble(
      { data: { navUnit: '0101' } },
      { enhetMaVelgesVedPapirInnsending: true, mottaksadresseId: 'recipient-id' },
      [],
      recipient,
    );
    expect(result.recipient).toEqual({
      name: 'Nav Test',
      postOfficeBox: '1234',
      postalCode: '0101',
      postalName: 'Oslo',
    });
  });

  it.each([
    ['hidden user types', { hideUserTypes: true }, {}, undefined],
    ['forced Nav unit', { enhetMaVelgesVedPapirInnsending: true }, { navUnit: '0101' }, '0101'],
    [
      'multiple people with cleared user information',
      {},
      { userType: 'multiple-people', navUnit: '0101', dineOpplysninger: {} },
      '0101',
    ],
  ] as const)('sends no user for %s', async (_, properties, data, unit) => {
    const result = await assemble({ data: { ...data } }, properties);
    expect(result.user).toBeUndefined();
    const body = coverPageMapper.createRequestBodyFromDownloadData(result);
    expect(body).not.toHaveProperty('bruker');
    expect(body).not.toHaveProperty('ukjentBrukerPersoninfo');
    expect(body.enhetsnummer).toBe(unit);
  });

  it('keeps authored order, canonical IDs, translated labels and user descriptions verbatim in both lists', async () => {
    const submission = unidentified();
    submission.data.sendinnAttachment2 = { second: attachment('second-id', '  User description  ') };
    submission.data.sendinnAttachment3 = {
      other: [{ ...attachment('other-id', 'Custom other title'), type: 'other' }],
    };
    const result = await assemble(submission, {}, ['N3', 'N2', 'N1']);
    expect(result.attachments).toEqual(['Translated first', '  User description  ', 'Custom other title']);
    expect(result.attachmentsForArchiving).toEqual(['First document', '  User description  ', 'Custom other title']);
    expect((await assemble(unidentified(), {}, ['N1'])).attachments).toEqual(['Translated first']);
  });
});
