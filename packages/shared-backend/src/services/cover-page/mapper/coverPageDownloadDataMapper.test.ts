import { Component, Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageDownloadDataMapper } from './coverPageDownloadDataMapper';

describe('coverPageDownloadDataMapper', () => {
  const generateAttachmentComponent = (key, label, vedleggskode, vedleggstittel) => ({
    label,
    values: [{ label: 'Jeg legger det ved denne søknaden (anbefalt)', value: 'leggerVedNaa', shortcut: '' }],
    key,
    properties: {
      vedleggstittel,
      vedleggskode,
    },
    type: 'radio',
  });

  const formWithAttachments = {
    title: 'Testskjema',
    properties: {
      skjemanummer: 'NAV 12.34-56',
      tema: 'AAP',
      submissionTypes: ['PAPER'],
      subsequentSubmissionTypes: [],
      mottaksadresseId: '001',
    },
    components: [
      {
        type: 'container',
        key: 'yourInformation',
        yourInformation: true,
      },
      generateAttachmentComponent('attachment1', 'Vedlegg label', 'A1', 'Vedlegg title'),
    ] as Component[],
  } as unknown as Form;

  it('creates download data from submission', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission(
      formWithAttachments,
      {
        data: {
          yourInformation: {
            fornavn: 'Test',
            etternavn: 'Testesen',
            adresse: {
              adresse: 'Testveien 1',
              postnummer: '0101',
              bySted: 'Oslo',
            },
          },
          attachment1: 'leggerVedNaa',
        },
      } as Submission,
      'nb-NO',
      { recipientId: '001', name: 'NAV Test', poBoxAddress: '1234', postalCode: '0101', postalName: 'Oslo' },
      undefined,
      (text) => text,
      'paper',
    );

    expect(actual).toEqual({
      type: 'SKJEMA',
      submissionType: 'PAPER',
      languageCode: 'nb',
      form: {
        title: 'Testskjema',
        skjemanummer: 'NAV 12.34-56',
        properties: formWithAttachments.properties,
      },
      user: {
        firstName: 'Test',
        surname: 'Testesen',
        address: {
          co: undefined,
          postOfficeBox: undefined,
          streetAddress: 'Testveien 1',
          building: undefined,
          postalCode: '0101',
          postalName: 'Oslo',
          region: undefined,
          country: undefined,
        },
      },
      recipient: {
        name: 'NAV Test',
        postOfficeBox: '1234',
        postalCode: '0101',
        postalName: 'Oslo',
      },
      attachments: ['Vedlegg label'],
    });
  });

  it('uses organization number fallback and nav unit recipient', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission(
      {
        title: 'Testskjema',
        properties: {
          skjemanummer: 'NAV 12.34-56',
          tema: 'AAP',
          submissionTypes: ['PAPER'],
          subsequentSubmissionTypes: [],
        },
        components: [
          {
            type: 'orgNr',
            key: 'organizationNumber',
            label: 'Organization number',
            coverPageUser: true,
          },
        ] as Component[],
      } as unknown as Form,
      {
        data: {
          organizationNumber: '889 640 782',
        },
      } as Submission,
      'nb-NO',
      undefined,
      '9999',
      undefined,
      'paper',
    );

    expect(actual.user).toEqual({
      organizationNumber: '889640782',
    });
    expect(actual.recipient).toEqual({
      navUnit: '9999',
    });
  });

  it('prefers your information over an organization-number cover-page user', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission(
      {
        ...formWithAttachments,
        components: [
          ...formWithAttachments.components,
          {
            type: 'orgNr',
            key: 'organizationNumber',
            label: 'Organization number',
            coverPageUser: true,
          },
        ],
      },
      {
        data: {
          yourInformation: {
            identitet: { identitetsnummer: '123 456 789 11' },
          },
          organizationNumber: '889 640 782',
        },
      } as Submission,
    );

    expect(actual.user).toEqual({ nationalIdentityNumber: '123 456 789 11' });
  });

  it('preserves flat legacy person fields and address precedence', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission(
      {
        ...formWithAttachments,
        components: [],
      },
      {
        data: {
          fornavnSoker: 'Legacy',
          etternavnSoker: 'User',
          gateadresseSoker: 'Flat street',
          postnrSoker: '1111',
          poststedSoker: 'Flat town',
          norskVegadresse: {
            vegadresseSoker: 'Nested street',
            postnrSoker: '2222',
            poststedSoker: 'Nested town',
          },
        },
      } as Submission,
    );

    expect(actual.user).toEqual({
      firstName: 'Legacy',
      surname: 'User',
      address: expect.objectContaining({
        streetAddress: 'Nested street',
        postalCode: '2222',
        postalName: 'Nested town',
      }),
    });
  });

  it('rejects a name-only user without an address', () => {
    expect(() =>
      coverPageDownloadDataMapper.createDownloadDataFromSubmission(
        formWithAttachments,
        {
          data: {
            yourInformation: {
              fornavn: 'Name',
              etternavn: 'Only',
            },
          },
        } as Submission,
      ),
    ).toThrow('User needs to submit either identification number or address');
  });

  it('forwards an identity value without stricter validation or normalization', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission(
      formWithAttachments,
      {
        data: {
          yourInformation: {
            identitet: { identitetsnummer: 'not valid' },
          },
        },
      } as Submission,
    );

    expect(actual.user).toEqual({ nationalIdentityNumber: 'not valid' });
  });
});
