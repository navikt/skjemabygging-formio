import { Component, Form } from '@navikt/skjemadigitalisering-shared-domain';

const createBaseForm = (path: string, revision: number, components: Component[]): Form => ({
  components,
  skjemanummer: 'NAV 00-00.00',
  path,
  properties: {
    skjemanummer: 'NAV 00-00.00',
    submissionTypes: [],
    subsequentSubmissionTypes: [],
    tema: 'TEST',
  },
  revision,
  title: `Anonymized ${path}`,
});

const anonymizedGroundSupportForm = createBaseForm('nav060304', 20, [
  {
    input: false,
    key: 'applicationScope',
    label: 'Application scope',
    type: 'panel',
    components: [
      {
        input: true,
        key: 'whatAreYouApplyingFor',
        label: 'What are you applying for?',
        type: 'radiopanel',
        values: [
          { label: 'Support', value: 'support' },
          { label: 'Increase', value: 'increase' },
        ],
        validate: { required: true },
      },
    ],
  },
  {
    input: false,
    key: 'applicantInfo',
    label: 'Applicant info',
    type: 'panel',
    components: [
      {
        input: false,
        key: 'group',
        label: 'Layout group',
        type: 'navSkjemagruppe',
        components: [
          {
            input: true,
            key: 'adultApplicantInfo',
            label: 'Adult applicant info',
            type: 'container',
            components: [
              { input: true, key: 'firstName', label: 'First name', type: 'textfield', validate: { required: true } },
              { input: true, key: 'lastName', label: 'Last name', type: 'textfield' },
              { input: true, key: 'phoneNumber', label: 'Phone number', type: 'phoneNumber' },
            ],
          },
        ],
      },
    ],
  },
  {
    input: false,
    key: 'travel',
    label: 'Travel',
    type: 'panel',
    components: [
      {
        input: true,
        key: 'travelRows',
        label: 'Travel rows',
        type: 'datagrid',
        components: [
          { input: true, key: 'destination', label: 'Destination', type: 'textfield', validate: { required: true } },
          {
            input: false,
            key: 'rowGroup',
            label: 'Row group',
            type: 'navSkjemagruppe',
            components: [{ input: true, key: 'distanceKm', label: 'Distance', type: 'number' }],
          },
          {
            input: true,
            key: 'transportInfo',
            label: 'Transport info',
            type: 'container',
            components: [{ input: true, key: 'comment', label: 'Comment', type: 'textarea' }],
          },
        ],
      },
    ],
  },
]);

const anonymizedGroundSupportSubmission = {
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
};

const anonymizedDisabilityFormV1 = createBaseForm('nav120605', 3, [
  {
    input: false,
    key: 'personaliaPanel',
    label: 'Personalia panel',
    type: 'panel',
    components: [
      {
        input: true,
        key: 'personalInfo',
        label: 'Personal info',
        type: 'container',
        components: [{ input: true, key: 'givenName', label: 'Given name', type: 'textfield' }],
      },
    ],
  },
]);

const anonymizedDisabilityFormV2 = createBaseForm('nav120605', 4, [
  {
    input: false,
    key: 'personaliaPanel',
    label: 'Personalia panel',
    type: 'panel',
    components: [
      {
        input: true,
        key: 'personalInfo',
        label: 'Personal info',
        type: 'container',
        components: [
          { input: true, key: 'givenName', label: 'Given name', type: 'textfield' },
          { input: true, key: 'familyName', label: 'Family name', type: 'textfield' },
        ],
      },
    ],
  },
]);

const anonymizedConsentForm = createBaseForm('nav951509', 1, [
  {
    input: false,
    key: 'senderPanel',
    label: 'Sender panel',
    type: 'panel',
    components: [
      {
        input: true,
        key: 'avsenderPerson',
        label: 'Sender',
        type: 'sender',
      },
      {
        input: true,
        key: 'identitet',
        label: 'Identity',
        type: 'identity',
      },
    ],
  },
]);

const anonymizedConsentSubmission = {
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
};

export {
  anonymizedConsentForm,
  anonymizedConsentSubmission,
  anonymizedDisabilityFormV1,
  anonymizedDisabilityFormV2,
  anonymizedGroundSupportForm,
  anonymizedGroundSupportSubmission,
};
