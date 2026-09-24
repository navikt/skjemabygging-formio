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
      const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission(formWithAttachments, submission);
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
      const actual = coverPageDownloadDataMapper.createDownloadDataFromSubmission(formWithAttachments, {
        data: { attachment1: answer },
        attachments: [
          { attachmentId: 'legacy', navId: 'attachment1', type: 'default', value: 'leggerVedNaa', files: [] },
        ],
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
    expect(coverPageDownloadDataMapper.createDownloadDataFromSubmission(form, submission).attachments).toEqual([
      'Vedlegg label',
    ]);
  });

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
});
