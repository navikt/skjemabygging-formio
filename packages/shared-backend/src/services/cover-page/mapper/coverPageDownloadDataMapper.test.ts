import { Component, Form, Submission, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageDownloadDataMapper } from './coverPageDownloadDataMapper';

describe('coverPageDownloadDataMapper', () => {
  const generateAttachmentComponent = (key, label, vedleggskode, vedleggstittel) => ({
    label,
    values: [{ label: 'Jeg legger det ved denne søknaden (anbefalt)', value: 'leggerVedNaa', shortcut: '' }],
    key,
    navId: key,
    properties: {
      vedleggstittel,
      vedleggskode,
    },
    type: 'attachment',
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

  it.each([
    ['leggerVedNaa', 'ettersender', false],
    ['ettersender', 'leggerVedNaa', true],
    ['leggerVedNaa', '', false],
    ['leggerVedNaa', undefined, false],
  ])('uses the authoritative legacy answer %s -> %s', (dataValue, value, included) => {
    for (const answer of [dataValue, { key: dataValue }]) {
      const submission: Submission = {
        data: { attachment1: answer },
        attachments: [{ attachmentId: 'attachment1', navId: 'attachment1', type: 'default', value, files: [] }],
      };
      const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission({
        form: formWithAttachments,
        submission,
      });
      expect(actual.attachments).toEqual(included ? ['Vedlegg label'] : []);
    }
  });

  it.each(['ettersender', '', undefined])('does not revive obsolete uploads for canonical answer %s', (value) => {
    const canonical: SubmissionAttachment = {
      attachmentId: 'canonical',
      navId: 'attachment1',
      type: 'default',
      value,
      files: [],
    };
    for (const answer of [canonical, [canonical]]) {
      const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission({
        form: formWithAttachments,
        submission: {
          data: { attachment1: answer },
          attachments: [
            { attachmentId: 'legacy', navId: 'attachment1', type: 'default', value: 'leggerVedNaa', files: [] },
          ],
        },
      });
      expect(actual.attachments).toEqual([]);
    }
  });

  it.each(['other', 'datagrid'] as const)('includes a component when a later %s document is attached', (kind) => {
    const component = { ...formWithAttachments.components[1], attachmentType: 'other' as const };
    const answers: SubmissionAttachment[] = [
      { attachmentId: 'first', navId: 'attachment1', type: 'other', value: 'ettersender', files: [] },
      { attachmentId: 'second', navId: 'attachment1', type: 'other', value: 'leggerVedNaa', files: [] },
    ];
    const form = {
      ...formWithAttachments,
      components:
        kind === 'datagrid' ? [{ key: 'rows', type: 'datagrid', input: true, components: [component] }] : [component],
    } as Form;
    const submission: Submission = {
      data:
        kind === 'datagrid'
          ? { rows: answers.map((answer) => ({ attachment1: answer })) }
          : { attachment1: { key: 'nei' } },
      attachments: kind === 'other' ? answers : [],
    };
    expect(coverPageDownloadDataMapper.createDownloadDataFromSubmission({ form, submission }).attachments).toEqual([
      'Vedlegg label',
    ]);
  });

  it('creates download data from submission', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission({
      form: formWithAttachments,
      submission: {
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
      languageCode: 'nb-NO',
      recipient: { recipientId: '001', name: 'NAV Test', poBoxAddress: '1234', postalCode: '0101', postalName: 'Oslo' },
      translate: (text) => (text === 'Vedlegg label' ? 'Attachment label' : text),
      submissionMethod: 'paper',
    });

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
      attachments: ['Attachment label'],
      attachmentsForArchiving: ['Vedlegg label'],
    });
  });

  it('prints translated labels but archives original labels, leaving user titles untranslated', () => {
    const form: Form = {
      ...formWithAttachments,
      components: [
        formWithAttachments.components[1],
        {
          ...formWithAttachments.components[1],
          key: 'other',
          navId: 'other',
          attachmentType: 'other',
        },
      ],
    };
    const submission: Submission = {
      data: {
        attachment1: { attachmentId: 'attachment1', navId: 'attachment1', type: 'default', value: 'leggerVedNaa' },
        other: [{ attachmentId: 'other', navId: 'other', type: 'other', value: 'leggerVedNaa', title: 'My documents' }],
      },
    };
    const translate = () => 'Translated attachment';

    expect(coverPageDownloadDataMapper.createAttachmentDocumentLists(form, submission, translate)).toEqual({
      attachments: ['Translated attachment', 'My documents'],
      attachmentsForArchiving: ['Vedlegg label', 'My documents'],
    });
  });

  it('uses the label when no title exists and excludes stale titles for unselected attachments', () => {
    const submission: Submission = {
      data: {
        attachment1: [
          { attachmentId: 'first', navId: 'attachment1', type: 'other', value: 'leggerVedNaa' },
          { attachmentId: 'second', navId: 'attachment1', type: 'other', value: 'ettersender', title: 'Not selected' },
        ],
      },
      attachments: [
        { attachmentId: 'obsolete', navId: 'attachment1', type: 'other', value: 'leggerVedNaa', title: 'Obsolete' },
      ],
    };

    expect(coverPageDownloadDataMapper.createAttachmentDocumentLists(formWithAttachments, submission)).toEqual({
      attachments: ['Vedlegg label'],
      attachmentsForArchiving: ['Vedlegg label'],
    });
  });

  it('sends no cover-page user when the submission has no party data', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission({
      form: formWithAttachments,
      submission: { data: {} },
    });

    expect(actual.user).toBeUndefined();
  });

  it('uses organization number fallback and nav unit recipient', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission({
      form: {
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
            key: 'emptyOrganizationNumber',
            label: 'Empty organization number',
            coverPageUser: true,
          },
          {
            type: 'orgNr',
            key: 'organizationNumber',
            label: 'Organization number',
            coverPageUser: true,
          },
        ] as Component[],
      } as unknown as Form,
      submission: {
        data: {
          organizationNumber: 889640782,
          fornavnSoker: '',
          poststedSoker: ' ',
          norskVegadresse: {},
        },
      } as Submission,
      languageCode: 'nb-NO',
      unitNumber: '9999',
      submissionMethod: 'paper',
    });

    expect(actual.user).toEqual({
      organizationNumber: '889640782',
    });
    expect(actual.recipient).toEqual({
      navUnit: '9999',
    });
  });

  it('uses the flagged organization as user for a multiple-people party', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission({
      form: {
        title: 'Testskjema',
        properties: {
          skjemanummer: 'NAV 12.34-56',
          tema: 'AAP',
          submissionTypes: ['PAPER'],
          subsequentSubmissionTypes: [],
        },
        components: [
          { type: 'sender', key: 'sender', input: true },
          {
            type: 'orgNr',
            key: 'organizationNumber',
            label: 'Organization number',
            coverPageUser: true,
          },
        ] as Component[],
      } as unknown as Form,
      submission: {
        data: {
          sender: {
            organization: {
              name: 'Organization',
              number: '889 640 782',
            },
          },
          organizationNumber: '889 640 782',
        },
      } as Submission,
      languageCode: 'nb-NO',
      unitNumber: '9999',
    });

    expect(actual.user).toEqual({ organizationNumber: '889640782' });
    expect(actual.recipient).toEqual({ navUnit: '9999' });
  });

  it('prefers your information over an organization-number cover-page user', () => {
    const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission({
      form: {
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
      submission: {
        data: {
          yourInformation: {
            identitet: { identitetsnummer: '123 456 789 11' },
          },
          organizationNumber: '889 640 782',
        },
      } as Submission,
    });

    expect(actual.user).toEqual({ nationalIdentityNumber: '123 456 789 11' });
  });
});
