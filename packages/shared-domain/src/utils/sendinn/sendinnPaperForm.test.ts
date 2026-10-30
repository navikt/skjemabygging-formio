import { Form, FormPropertiesType, Submission } from '../../models';
import { TEXTS } from '../../texts';
import { attachmentUtils } from '../attachment';
import { flattenComponents, navFormUtils } from '../form';
import { resolveParty } from '../party';
import { normalizeSendinnAttachmentFilter } from './sendinnAttachmentFilter';
import { SendinnCollectionType } from './sendinnPaperCollection';
import { convertToSendinnPaperForm } from './sendinnPaperForm';

const createSource = (properties: Partial<FormPropertiesType> = {}): Form => ({
  id: 123,
  revision: 7,
  publicationId: 'published-version',
  status: 'published',
  publishedLanguages: ['nb', 'nn', 'en'],
  skjemanummer: 'NAV TEST',
  path: 'navtest',
  title: 'Source title',
  firstPanelSlug: 'applicationQuestions',
  introPage: {
    enabled: true,
    introduction: 'Application introduction',
    sections: { prerequisites: {} },
    selfDeclaration: 'Application declaration',
  },
  properties: {
    skjemanummer: 'NAV TEST',
    tema: 'TES',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
    ettersendelsesfrist: '14',
    mottaksadresseId: 'postal-address',
    navUnitDescription: 'Source routing description',
    enhetstyper: ['LOKAL', 'ALS'],
    publishedLanguages: ['nb', 'nn', 'en'],
    ...properties,
  },
  components: [
    { type: 'sender', key: 'sender', label: 'Application sender' },
    {
      type: 'panel',
      key: 'applicationQuestions',
      label: 'Application questions',
      components: [
        { type: 'textfield', key: 'unrelatedQuestion', label: 'Application question', input: true },
        {
          type: 'attachment',
          key: 'secondAlphabetically',
          label: 'Z document',
          id: 'legacy-document-id',
          navId: 'document-z',
          description: 'Authored description',
          properties: { vedleggskode: ' N2 ', vedleggstittel: 'Archive title', vedleggskjema: 'NAV A' },
          attachmentType: 'default',
          validate: { required: true, custom: 'Source application validation' },
          conditional: { when: 'unrelatedQuestion', eq: 'yes', show: true },
          customConditional: 'Source application condition',
          calculateValue: 'Source application calculation',
          defaultValue: 'leggerVedNaa',
          prefillValue: 'leggerVedNaa',
          hidden: true,
          readOnly: true,
          values: [{ value: 'ettersender', label: 'Source option' }],
        },
        {
          type: 'container',
          key: 'sourceContainer',
          label: 'Application group',
          components: [
            {
              type: 'attachment',
              key: 'otherDocumentation',
              id: 'other-document-id',
              label: 'Other documentation',
              attachmentType: 'other',
              properties: { vedleggskode: 'N6', vedleggstittel: 'Other' },
              additionalDescriptionLabel: 'Authored help title',
              additionalDescriptionText: 'Authored help',
            },
            { type: 'attachment', key: 'uncoded', label: 'Document without a code' },
          ],
        },
      ],
    },
  ],
});

const convert = (source = createSource(), filter?: string | readonly string[]) =>
  convertToSendinnPaperForm(source, { attachmentFilter: normalizeSendinnAttachmentFilter(filter) });

const getAttachments = (form: Form) => flattenComponents(form.components).filter(({ type }) => type === 'attachment');
const getCollection = (form: Form) => form.components.find(({ key }) => key === 'sendinnCollection')?.components ?? [];
const getActiveForm = (form: Form, data: Submission['data']): Form => ({
  ...form,
  components: navFormUtils.getAllActivePanelsFromForm(form, { data }, { submissionMethod: 'paper' }),
});
const activeKeys = (form: Form, data: Submission['data']) =>
  flattenComponents(getActiveForm(form, data).components).map(({ key }) => key);

describe('convertToSendinnPaperForm', () => {
  it('preserves form identity, publication and routing metadata without reusing the application flow', () => {
    const source = createSource();
    const result = convert(source);
    expect(result).toMatchObject({
      id: source.id,
      revision: source.revision,
      publicationId: source.publicationId,
      status: source.status,
      skjemanummer: source.skjemanummer,
      path: source.path,
      title: source.title,
      publishedLanguages: source.publishedLanguages,
      properties: { ...source.properties, submissionTypes: ['PAPER'] },
      firstPanelSlug: 'sendinnCollection',
    });
    expect(result.introPage).toBeUndefined();
    expect(result.components.map(({ key }) => key)).toEqual(['sendinnCollection', 'sendinnAttachments']);
    expect(flattenComponents(result.components).map(({ key }) => key)).not.toContain('unrelatedQuestion');
    expect(flattenComponents(result.components).some(({ type }) => type === 'sender' || type === 'orgNr')).toBe(false);
  });

  it('preserves attachment identity, translation keys and authored order while removing application behavior', () => {
    const source = createSource();
    const attachments = getAttachments(convert(source));
    const originals = getAttachments(source);
    expect(attachments.map(({ key }) => key)).toEqual(originals.map(({ key }) => key));
    attachments.forEach((attachment, index) => {
      const original = originals[index];
      expect(attachment).toMatchObject({
        label: original.label,
        id: original.id,
        navId: original.navId,
        description: original.description,
        properties: original.properties,
        attachmentType: original.attachmentType,
        additionalDescriptionLabel: original.additionalDescriptionLabel,
        additionalDescriptionText: original.additionalDescriptionText,
        attachmentValues: { leggerVedNaa: { enabled: true } },
        validate: { required: false },
      });
      [
        'conditional',
        'customConditional',
        'calculateValue',
        'defaultValue',
        'prefillValue',
        'hidden',
        'readOnly',
      ].forEach((property) => expect(attachment).not.toHaveProperty(property));
      expect(attachmentUtils.getImplicitValueKey(attachment.attachmentValues, 'paper')).toBeUndefined();
    });
    expect(attachments[1].attachmentType).toBe('other');
  });

  it.each<{ filter?: string | readonly string[]; keys: string[] }>([
    { filter: undefined, keys: ['secondAlphabetically', 'otherDocumentation', 'uncoded'] },
    { filter: [' , ', ''], keys: ['secondAlphabetically', 'otherDocumentation', 'uncoded'] },
    { filter: ['N6', ' N2,N6 '], keys: ['secondAlphabetically', 'otherDocumentation'] },
    { filter: ' N6 ', keys: ['otherDocumentation'] },
    { filter: 'unknown,N6', keys: ['otherDocumentation'] },
    { filter: 'n6', keys: [] },
    { filter: 'unknown', keys: [] },
  ])('filters availability for $filter without reordering or selecting attachments', ({ filter, keys }) => {
    const form = convert(createSource(), filter);
    expect(getAttachments(form).map(({ key }) => key)).toEqual(keys);
    expect(attachmentUtils.resolveSubmissionAttachments(form, { data: {} })).toEqual([]);
    expect(form.components.find(({ key }) => key === 'sendinnAttachments')).toBeDefined();
  });

  it('keeps canonical attachment answers and the other-documentation title for later T1 composition', () => {
    const form = convert(createSource(), 'N6');
    const selected = {
      attachmentId: 'other-document-id',
      navId: 'other-document-id',
      type: 'other',
      value: 'leggerVedNaa',
      title: 'My document',
      files: [],
    };
    const submission = { data: { sendinnAttachment2: { otherDocumentation: [selected] } } };
    expect(attachmentUtils.resolveSubmissionAttachments(form, submission)).toEqual([selected]);
    expect(attachmentUtils.getAttachmentsForCoverPage(submission, form).map(({ key }) => key)).toEqual([
      'otherDocumentation',
    ]);
  });

  it('keeps duplicate source keys and collection-name collisions in distinct stable attachment paths', () => {
    const source = createSource();
    const originals = getAttachments(source);
    originals[1].key = originals[0].key;
    originals[2].key = 'collectionType';
    const form = convert(source);
    const submission = {
      data: {
        collectionType: 'identified-person',
        sendinnAttachment1: { secondAlphabetically: 'leggerVedNaa' },
        sendinnAttachment2: { secondAlphabetically: 'leggerVedNaa' },
        sendinnAttachment3: { collectionType: 'leggerVedNaa' },
      },
    };
    expect(attachmentUtils.resolveSubmissionAttachments(form, submission).map(({ navId }) => navId)).toEqual([
      'document-z',
      'other-document-id',
      'collectionType',
    ]);
    const filtered = convert(source, 'N6');
    expect(filtered.components.find(({ key }) => key === 'sendinnAttachments')?.components?.[0].key).toBe(
      'sendinnAttachment2',
    );
    expect(
      attachmentUtils.collectAttachmentsFromData(filtered.components, submission).map(({ navId }) => navId),
    ).toEqual(['other-document-id']);
  });

  it.each([
    { hideUserTypes: undefined, override: undefined },
    { hideUserTypes: undefined, override: false },
    { hideUserTypes: false, override: undefined },
    { hideUserTypes: false, override: false },
  ])(
    'offers all three branches with hideUserTypes=$hideUserTypes and override=$override',
    ({ hideUserTypes, override }) => {
      const form = convert(createSource({ hideUserTypes, enhetMaVelgesVedPapirInnsending: override }));
      const choice = getCollection(form).find(({ key }) => key === 'collectionType');
      expect(choice?.values?.map(({ value }) => value)).toEqual([
        'identified-person',
        'unidentified-person',
        'multiple-people',
      ]);
      expect(choice?.validate).toEqual({ required: true, onlyAvailableItems: true });
      expect(choice?.defaultValue).toBeUndefined();
    },
  );

  it.each([undefined, false])('collects only a required unit when forced and hideUserTypes is %s', (hideUserTypes) => {
    const form = convert(createSource({ hideUserTypes, enhetMaVelgesVedPapirInnsending: true }));
    expect(getCollection(form)).toEqual([
      {
        type: 'navUnitSelect',
        key: 'navUnit',
        label: TEXTS.statiske.navUnit.choose,
        description: 'Source routing description',
        input: true,
        clearOnHide: true,
        validate: { required: true },
        unitTypes: ['LOKAL', 'ALS'],
      },
    ]);
    expect(resolveParty(form, { data: { navUnit: '1234' } })).toBeUndefined();
  });

  it.each([undefined, false, true])('hides all collection regardless of unit override %s', (override) => {
    const form = convert(createSource({ hideUserTypes: true, enhetMaVelgesVedPapirInnsending: override }));
    expect(form.components.map(({ key }) => key)).toEqual(['sendinnAttachments']);
    expect(form.firstPanelSlug).toBe('sendinnAttachments');
    expect(flattenComponents(form.components).some(({ type }) => type === 'navUnitSelect')).toBe(false);
    expect(resolveParty(form, { data: {} })).toBeUndefined();
  });

  it('uses shared conditions to separate person branches and Nav-contact routing', () => {
    const form = convert();
    const identified = activeKeys(form, { collectionType: 'identified-person' });
    expect(identified).toContain('identitetsnummer');
    expect(identified).not.toContain('fornavn');
    expect(identified).not.toContain('hasNavContact');
    expect(identified).not.toContain('navUnit');
    const unidentified = activeKeys(form, { collectionType: 'unidentified-person', hasNavContact: 'nei' });
    expect(unidentified).toEqual(expect.arrayContaining(['fornavn', 'etternavn', 'adresse', 'hasNavContact']));
    expect(unidentified).not.toContain('identitet');
    expect(unidentified).not.toContain('navContactUnit');
    expect(unidentified).not.toContain('navUnit');
    expect(activeKeys(form, { collectionType: 'unidentified-person', hasNavContact: 'ja' })).toContain(
      'navContactUnit',
    );
    const multiple = activeKeys(form, { collectionType: 'multiple-people', hasNavContact: 'ja' });
    expect(multiple).toContain('navUnit');
    expect(multiple).not.toContain('yourInformation');
    expect(multiple).not.toContain('hasNavContact');
    expect(multiple).not.toContain('navContactUnit');
    const units = flattenComponents(form.components).filter(({ type }) => type === 'navUnitSelect');
    expect(units).toHaveLength(2);
    units.forEach((unit) => expect(unit).toMatchObject({ validate: { required: true }, clearOnHide: true }));
  });

  it.each<{ collectionType: SendinnCollectionType; information: object; expected: object }>([
    {
      collectionType: 'identified-person',
      information: { identitet: { identitetsnummer: '12345678911' } },
      expected: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
    },
    {
      collectionType: 'unidentified-person',
      information: {
        fornavn: 'Test',
        etternavn: 'Testesen',
        adresse: { adresse: 'Test street', postnummer: '0101', land: { value: 'NO', label: 'Norway' } },
      },
      expected: {
        kind: 'unidentified-person',
        firstName: 'Test',
        surname: 'Testesen',
        address: { streetAddress: 'Test street', postalCode: '0101', country: { value: 'NO', label: 'Norway' } },
      },
    },
  ])('resolves $collectionType through the existing party resolver', ({ collectionType, information, expected }) => {
    const form = convert();
    const data = { collectionType, yourInformation: information };
    expect(resolveParty(getActiveForm(form, data), { data })).toMatchObject({ onBehalfOf: 'self', user: expected });
    const multipleData = { ...data, collectionType: 'multiple-people', navUnit: '1234' };
    expect(resolveParty(getActiveForm(form, multipleData), { data: multipleData })).toBeUndefined();
  });

  it('does not mutate or share source metadata, and produces identical definitions on both server paths', () => {
    const source = createSource();
    const original = structuredClone(source);
    const loading = convert(source, ['N6, N2']);
    const generation = convert(structuredClone(source), ['N6', 'N2']);
    expect(loading).toEqual(generation);
    expect(source).toEqual(original);
    expect(loading.properties).not.toBe(source.properties);
    expect(loading.publishedLanguages).not.toBe(source.publishedLanguages);
    getAttachments(loading)[0].properties!.vedleggstittel = 'Changed outside the converter';
    expect(source).toEqual(original);
  });
});
