import { Component, Form } from '@navikt/skjemadigitalisering-shared-domain';
import { vi } from 'vitest';
import { logger } from '../logger';
import { generateSchema } from './generateSchema';
import {
  anonymizedConsentForm,
  anonymizedConsentSubmission,
  anonymizedDisabilityFormV1,
  anonymizedDisabilityFormV2,
  anonymizedGroundSupportForm,
  anonymizedGroundSupportSubmission,
} from './testdata/anonymizedExamples';
import { JsonSchemaObject } from './types';

const createForm = (components: Component[] = [], introPageEnabled = false): Form => ({
  components,
  ...(introPageEnabled
    ? {
        introPage: {
          enabled: true,
          introduction: 'Introduction',
          sections: {
            prerequisites: {},
            beAwareOf: {},
            dataDisclosure: {},
          },
          selfDeclaration: 'Self declaration',
        },
      }
    : {}),
  skjemanummer: 'NAV 00-00.00',
  path: 'test-form',
  properties: {
    skjemanummer: 'NAV 00-00.00',
    submissionTypes: [],
    subsequentSubmissionTypes: [],
    tema: 'TEST',
  },
  title: 'Test form',
});

const getSubmissionPayloadSchema = (schema: ReturnType<typeof generateSchema>) =>
  schema.properties.data as JsonSchemaObject;
const getFormDataSchema = (schema: ReturnType<typeof generateSchema>) =>
  getSubmissionPayloadSchema(schema).properties.data as JsonSchemaObject;

describe('generateSchema', () => {
  it('creates a minimal schema for an empty form', () => {
    expect(generateSchema(createForm())).toEqual({
      $id: 'https://skjemabygging.nav.no/forms/test-form/spec',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      additionalProperties: false,
      properties: {
        data: {
          additionalProperties: false,
          properties: {
            data: {
              additionalProperties: false,
              properties: {},
              type: 'object',
            },
          },
          required: ['data'],
          type: 'object',
        },
        language: {
          type: 'string',
        },
      },
      required: ['language', 'data'],
      title: 'Test form',
      type: 'object',
    });
  });

  it('maps a required textfield', () => {
    const schema = generateSchema(
      createForm([
        {
          input: true,
          key: 'firstName',
          label: 'First name',
          type: 'textfield',
          validate: { required: true },
        },
      ]),
    );

    expect(getFormDataSchema(schema).properties).toEqual({
      firstName: {
        title: 'First name',
        type: 'string',
      },
    });
    expect(getFormDataSchema(schema).required).toEqual(['firstName']);
  });

  it('omits empty-string minLength and maxLength from generated schemas', () => {
    const schema = generateSchema(
      createForm([
        {
          input: true,
          key: 'comment',
          label: 'Comment',
          type: 'textfield',
          validate: {
            minLength: '' as unknown as number,
            maxLength: '' as unknown as number,
          },
        },
        {
          input: true,
          key: 'phone',
          label: 'Phone',
          type: 'phoneNumber',
          validate: {
            minLength: '' as unknown as number,
            maxLength: '' as unknown as number,
          },
        },
      ]),
    );

    expect(getFormDataSchema(schema).properties.comment).toEqual({
      title: 'Comment',
      type: 'string',
    });

    expect(getFormDataSchema(schema).properties.phone).toEqual({
      oneOf: [
        {
          type: 'string',
        },
        {
          additionalProperties: false,
          properties: {
            areaCode: { title: 'Area code', type: 'string' },
            number: { title: 'Phone number', type: 'string' },
          },
          required: ['number'],
          type: 'object',
        },
      ],
      title: 'Phone',
    });
  });

  it('omits empty-string minimum and maximum from generated schemas', () => {
    const schema = generateSchema(
      createForm([
        {
          input: true,
          key: 'monthlyAmount',
          label: 'Monthly amount',
          type: 'number',
          validate: {
            min: '' as unknown as number,
            max: '' as unknown as number,
          },
        },
      ]),
    );

    expect(getFormDataSchema(schema).properties.monthlyAmount).toEqual({
      title: 'Monthly amount',
      type: 'number',
    });
  });

  it('uses actual NAV component type names from shared-components', () => {
    const schema = generateSchema(
      createForm([
        {
          input: true,
          key: 'fornavn',
          label: 'Fornavn',
          type: 'firstName',
        },
        {
          input: true,
          key: 'land',
          label: 'Land',
          type: 'landvelger',
        },
        {
          data: { values: [{ label: 'Ja', value: 'yes' }] },
          input: true,
          key: 'valg',
          label: 'Valg',
          type: 'navSelect',
        },
        {
          input: true,
          key: 'telefon',
          label: 'Telefon',
          type: 'phoneNumber',
        },
        {
          input: true,
          key: 'identitet',
          label: 'Identitet',
          type: 'fnrfield',
        },
        {
          input: true,
          key: 'adresse',
          label: 'Adresse',
          type: 'navAddress',
        },
        {
          input: true,
          key: 'dato',
          label: 'Dato',
          type: 'navDatepicker',
        },
        {
          input: true,
          key: 'samtykke',
          label: 'Samtykke',
          type: 'navCheckbox',
        },
      ]),
    );

    const formDataSchema = getFormDataSchema(schema);

    expect(formDataSchema.properties?.fornavn).toEqual({ title: 'Fornavn', type: 'string' });
    expect(formDataSchema.properties?.land).toEqual({ title: 'Land', type: 'string' });
    expect(formDataSchema.properties?.valg).toEqual({ enum: ['yes'], title: 'Valg', type: 'string' });
    expect(formDataSchema.properties?.telefon).toMatchObject({
      oneOf: expect.any(Array),
      title: 'Telefon',
    });
    expect(formDataSchema.properties?.identitet).toMatchObject({
      title: 'Identitet',
      type: 'object',
    });
    expect(formDataSchema.properties?.adresse).toMatchObject({
      title: 'Adresse',
      type: 'object',
    });
    expect(formDataSchema.properties?.dato).toEqual({
      format: 'date',
      title: 'Dato',
      type: 'string',
    });
    expect(formDataSchema.properties?.samtykke).toEqual({ title: 'Samtykke', type: 'boolean' });
  });

  it('maps attachment values to enum entries when enabled', () => {
    const schema = generateSchema(
      createForm([
        {
          attachmentValues: {
            ettersender: { enabled: true },
            leggerVedNaa: { enabled: true },
            nei: { enabled: false },
          },
          input: true,
          key: 'vedlegg',
          label: 'Vedlegg',
          type: 'attachment',
        },
      ]),
    );

    expect(getFormDataSchema(schema).properties?.vedlegg).toEqual({
      enum: ['ettersender', 'leggerVedNaa'],
      title: 'Vedlegg',
      type: 'string',
    });
  });

  it('collects attachment panel attachments into top-level attachments and warns for ignored components', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger);

    const schema = generateSchema(
      createForm([
        {
          input: true,
          key: 'firstName',
          label: 'First name',
          type: 'textfield',
        },
        {
          input: false,
          isAttachmentPanel: true,
          key: 'attachmentsPanel',
          label: 'Attachments panel',
          type: 'panel',
          components: [
            {
              input: false,
              key: 'attachmentWrapper',
              label: 'Attachment wrapper',
              type: 'navSkjemagruppe',
              components: [
                {
                  attachmentType: 'default',
                  attachmentValues: {
                    ettersender: { enabled: true },
                    leggerVedNaa: { enabled: true },
                  },
                  input: true,
                  key: 'medicalCertificate',
                  label: 'Medical certificate',
                  navId: 'medical-certificate-navid',
                  type: 'attachment',
                },
                {
                  input: true,
                  key: 'ignoredField',
                  label: 'Ignored field',
                  type: 'textfield',
                },
              ],
            },
            {
              attachmentType: 'other',
              attachmentValues: {
                leggerVedNaa: { enabled: true },
                nei: { enabled: true },
              },
              input: true,
              key: 'otherDocumentation',
              label: 'Other documentation',
              navId: 'other-documentation-navid',
              type: 'attachment',
            },
          ],
        },
      ]),
    );

    expect(getFormDataSchema(schema).properties?.firstName).toEqual({
      title: 'First name',
      type: 'string',
    });
    expect(getSubmissionPayloadSchema(schema).properties?.attachments).toMatchObject({
      type: 'array',
      title: 'Attachments',
      items: {
        oneOf: [
          {
            title: 'Medical certificate',
            type: 'object',
            required: ['attachmentId', 'navId', 'type'],
            properties: {
              navId: { enum: ['medical-certificate-navid'], type: 'string' },
              type: { enum: ['default'], type: 'string' },
              value: {
                enum: ['ettersender', 'leggerVedNaa'],
                title: 'Medical certificate',
                type: 'string',
              },
            },
          },
          {
            title: 'Other documentation',
            type: 'object',
            required: ['attachmentId', 'navId', 'type'],
            properties: {
              navId: { enum: ['other-documentation-navid'], type: 'string' },
              type: { enum: ['other'], type: 'string' },
              value: {
                enum: ['leggerVedNaa', 'nei'],
                title: 'Other documentation',
                type: 'string',
              },
            },
          },
        ],
      },
    });
    expect(getFormDataSchema(schema).properties).not.toHaveProperty('attachmentsPanel');
    expect(warnSpy).toHaveBeenCalledWith(
      'Ignoring non-attachment component inside attachment panel during schema generation',
      {
        attachmentPanelKey: 'attachmentsPanel',
        componentKey: 'attachmentWrapper',
        componentType: 'navSkjemagruppe',
        formPath: 'test-form',
        revision: undefined,
      },
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Ignoring non-attachment component inside attachment panel during schema generation',
      {
        attachmentPanelKey: 'attachmentsPanel',
        componentKey: 'ignoredField',
        componentType: 'textfield',
        formPath: 'test-form',
        revision: undefined,
      },
    );

    warnSpy.mockRestore();
  });

  it('does not mark conditional fields as required', () => {
    const schema = generateSchema(
      createForm([
        {
          conditional: { eq: 'yes', show: true, when: 'needsDetails' },
          input: true,
          key: 'details',
          label: 'Details',
          type: 'textfield',
          validate: { required: true },
        },
      ]),
    );

    expect(getFormDataSchema(schema).required).toBeUndefined();
  });

  it('skips display-only components using actual shared-components type names', () => {
    const schema = generateSchema(
      createForm([
        {
          input: false,
          key: 'info',
          label: 'Info',
          type: 'alertstripe',
        },
        {
          input: false,
          key: 'markup',
          label: 'Markup',
          type: 'htmlelement',
        },
        {
          input: false,
          key: 'logo',
          label: 'Logo',
          type: 'image',
        },
        {
          input: true,
          key: 'firstName',
          label: 'First name',
          type: 'firstName',
        },
      ]),
    );

    expect(getFormDataSchema(schema).properties).toEqual({
      firstName: {
        title: 'First name',
        type: 'string',
      },
    });
  });

  it('uses fallback schema and logs for unknown component types', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger);

    const schema = generateSchema(
      createForm([
        {
          input: true,
          key: 'mystery',
          label: 'Mystery',
          type: 'mystery-component',
        },
      ]),
    );

    expect(getFormDataSchema(schema).properties?.mystery).toEqual({
      $comment: 'Unsupported component type: mystery-component',
    });
    expect(warnSpy).toHaveBeenCalledWith('Unsupported component encountered during schema generation', {
      componentKey: 'mystery',
      componentType: 'mystery-component',
      formPath: 'test-form',
      revision: undefined,
    });

    warnSpy.mockRestore();
  });

  it('uses structural rules from anonymized example fixtures', () => {
    const schema = generateSchema(anonymizedGroundSupportForm);
    const formDataSchema = getFormDataSchema(schema);

    expect(formDataSchema.properties?.whatAreYouApplyingFor).toEqual({
      enum: ['support', 'increase'],
      title: 'What are you applying for?',
      type: 'string',
    });
    expect(formDataSchema.properties?.adultApplicantInfo).toEqual({
      additionalProperties: false,
      properties: {
        firstName: { title: 'First name', type: 'string' },
        lastName: { title: 'Last name', type: 'string' },
        phoneNumber: {
          oneOf: [
            {
              maxLength: undefined,
              minLength: undefined,
              pattern: undefined,
              type: 'string',
            },
            {
              additionalProperties: false,
              properties: {
                areaCode: { title: 'Area code', type: 'string' },
                number: {
                  maxLength: undefined,
                  minLength: undefined,
                  pattern: undefined,
                  title: 'Phone number',
                  type: 'string',
                },
              },
              required: ['number'],
              type: 'object',
            },
          ],
          title: 'Phone number',
        },
      },
      required: ['firstName'],
      title: 'Adult applicant info',
      type: 'object',
    });
    expect(formDataSchema.properties?.travelRows).toEqual({
      items: {
        additionalProperties: false,
        properties: {
          destination: { title: 'Destination', type: 'string' },
          distanceKm: { title: 'Distance', type: 'number' },
          transportInfo: {
            additionalProperties: false,
            properties: {
              comment: { title: 'Comment', type: 'string' },
            },
            title: 'Transport info',
            type: 'object',
          },
        },
        required: ['destination'],
        type: 'object',
      },
      title: 'Travel rows',
      type: 'array',
    });
    expect(anonymizedGroundSupportSubmission).toEqual({
      data: {
        data: {
          adultApplicantInfo: {
            firstName: 'Sample',
            lastName: 'Person',
            phoneNumber: { areaCode: '+00', number: '00000000' },
          },
          travelRows: [
            {
              destination: 'Sample destination',
              distanceKm: 10,
              transportInfo: {
                comment: 'Sample comment',
              },
            },
          ],
          whatAreYouApplyingFor: 'support',
        },
      },
      language: 'nb',
    });
  });

  it('supports different revisions of the same form path', () => {
    const schemaV1 = generateSchema(anonymizedDisabilityFormV1);
    const schemaV2 = generateSchema(anonymizedDisabilityFormV2);
    const formDataSchemaV1 = getFormDataSchema(schemaV1);
    const formDataSchemaV2 = getFormDataSchema(schemaV2);

    expect(schemaV1.$id).toBe('https://skjemabygging.nav.no/forms/nav120605/spec?revision=3');
    expect(schemaV2.$id).toBe('https://skjemabygging.nav.no/forms/nav120605/spec?revision=4');
    expect(formDataSchemaV1.properties?.personalInfo).toEqual({
      additionalProperties: false,
      properties: {
        givenName: { title: 'Given name', type: 'string' },
      },
      title: 'Personal info',
      type: 'object',
    });
    expect(formDataSchemaV2.properties?.personalInfo).toEqual({
      additionalProperties: false,
      properties: {
        familyName: { title: 'Family name', type: 'string' },
        givenName: { title: 'Given name', type: 'string' },
      },
      title: 'Personal info',
      type: 'object',
    });
  });

  it('models structured composite leaf values from anonymized fixtures', () => {
    const schema = generateSchema(anonymizedConsentForm);
    const formDataSchema = getFormDataSchema(schema);

    expect(formDataSchema.properties?.avsenderPerson).toEqual({
      $comment: 'Sender component shape may vary between person and organization senders.',
      additionalProperties: true,
      properties: {
        organization: {
          additionalProperties: true,
          properties: {
            name: { title: 'Name', type: 'string' },
            organizationNumber: { title: 'Organization number', type: 'string' },
          },
          type: 'object',
        },
        person: {
          additionalProperties: true,
          properties: {
            firstName: { title: 'First name', type: 'string' },
            nationalIdentityNumber: { title: 'National identity number', type: 'string' },
            surname: { title: 'Surname', type: 'string' },
          },
          type: 'object',
        },
      },
      title: 'Sender',
      type: 'object',
    });
    expect(formDataSchema.properties?.identitet).toEqual({
      $comment: 'Identity component shape may vary between forms and is intentionally permissive.',
      additionalProperties: true,
      properties: {
        identitetsNummer: { title: 'Identity number', type: 'string' },
        identitetsnummer: { title: 'Identity number', type: 'string' },
        nationalIdentityNumber: { title: 'National identity number', type: 'string' },
      },
      title: 'Identity',
      type: 'object',
    });
    expect(anonymizedConsentSubmission).toEqual({
      data: {
        data: {
          avsenderPerson: {
            person: {
              nationalIdentityNumber: '00000000000',
              firstName: 'Sample',
              surname: 'Person',
            },
          },
          identitet: {
            identitetsnummer: '00000000000',
          },
        },
      },
      language: 'nb',
    });
  });

  it('includes selfDeclaration as required true when intro page is enabled', () => {
    const schema = generateSchema(createForm([], true));

    expect(getSubmissionPayloadSchema(schema).properties.selfDeclaration).toEqual({
      const: true,
      type: 'boolean',
    });
    expect(getSubmissionPayloadSchema(schema).required).toContain('selfDeclaration');
  });
});
