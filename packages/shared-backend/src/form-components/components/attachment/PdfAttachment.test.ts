import { Component, Submission, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';
import PdfAttachment from './PdfAttachment';
import { component as attachmentOtherOld } from './testdata/attachment-old-other';
import { component as attachmentOld } from './testdata/attachment-type-and-attachmentValues-missing';
import { component as attachmentOther } from './testdata/attachment-type-other';
import { component as attachment } from './testdata/attachment-with-the-lot';

const createProps = (
  component: Component,
  submission: Partial<Submission> = { data: {} },
  submissionMethod: PdfComponentProps['submissionMethod'] = 'digital',
): PdfComponentProps => ({
  submission: submission as Submission,
  translate: (textOrKey?: string) => textOrKey!,
  component,
  submissionPath: '',
  componentRegistry: {},
  currentLanguage: 'nb',
  submissionMethod,
});

describe('PdfAttachment', () => {
  it.each([
    ['leggerVedNaa', 'ettersender'],
    ['ettersender', 'leggerVedNaa'],
    ['leggerVedNaa', ''],
    ['leggerVedNaa', undefined],
  ])('uses the authoritative legacy choice %s -> %s', (dataValue, value) => {
    const legacy: SubmissionAttachment = {
      attachmentId: attachment.navId!,
      navId: attachment.navId!,
      type: 'default',
      value,
      files: [],
    };
    for (const answer of [dataValue, { key: dataValue }]) {
      expect(
        PdfAttachment(createProps(attachment, { data: { [attachment.key]: answer }, attachments: [legacy] }, 'paper')),
      ).toEqual(value ? [{ label: attachment.label, verdi: TEXTS.statiske.attachment[value] }] : null);
    }
  });

  it.each(['ettersender', '', undefined])('does not revive legacy uploads for canonical choice %s', (value) => {
    const canonical: SubmissionAttachment = {
      attachmentId: 'canonical',
      navId: attachment.navId!,
      type: 'default',
      value,
      files: [],
    };
    const legacy = { ...canonical, attachmentId: 'legacy', value: 'leggerVedNaa' };
    expect(
      PdfAttachment(createProps(attachment, { data: { [attachment.key]: canonical }, attachments: [legacy] }, 'paper')),
    ).toEqual(value ? [{ label: attachment.label, verdi: TEXTS.statiske.attachment.ettersender }] : null);
  });

  it.each(['paper', 'digital', 'digitalnologin'] as const)(
    'keeps the configured legacy other-document label in %s PDFs',
    (method) => {
      const option = attachmentOtherOld.values![2];
      const canonical: SubmissionAttachment = {
        attachmentId: attachmentOtherOld.navId!,
        navId: attachmentOtherOld.navId!,
        type: 'other',
        value: option.value,
        files: [],
      };
      for (const answer of [option.value, { key: option.value }, [canonical]]) {
        expect(
          PdfAttachment(
            createProps(
              attachmentOtherOld,
              {
                data: { [attachmentOtherOld.key]: answer },
              },
              method,
            ),
          ),
        ).toEqual([{ label: attachmentOtherOld.label, verdi: option.label }]);
      }
    },
  );
  it.each([false, true])(
    'renders canonical paper answers without digital document titles (collection: %s)',
    (multiple) => {
      const component = { ...attachment, attachmentType: multiple ? ('other' as const) : ('default' as const) };
      const answer: SubmissionAttachment = {
        attachmentId: component.navId!,
        navId: component.navId!,
        type: multiple ? 'other' : 'default',
        value: 'ettersender',
        title: 'Digital document title',
        files: [],
      };
      expect(
        PdfAttachment(
          createProps(
            component,
            {
              data: { [component.key]: multiple ? [answer] : answer },
            },
            'paper',
          ),
        ),
      ).toEqual([
        {
          label: component.label,
          verdi: TEXTS.statiske.attachment.ettersender,
        },
      ]);
    },
  );
  it('should include comment when additional documentation is present', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: 'levertTidligere',
        additionalDocumentation: 'Sendte denne inn i fjor',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toEqual([
      { label: 'Uttalelse fra lege', verdi: TEXTS.statiske.attachment.levertTidligere },
      {
        label: 'Når ble dette vedlegget levert?',
        verdiliste: [{ label: submissionAttachments[0].additionalDocumentation }],
        visningsVariant: 'PUNKTLISTE',
      },
    ]);
  });

  it('should include the selected answer', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: 'leggerVedNaa',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
    ]);
  });

  it('should use digital label for selected answer when submissionMethod is digital', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: 'leggerVedNaa',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments }, 'digital');
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
    ]);
  });

  it('should keep paper label for selected answer when submissionMethod is paper', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: 'ettersender',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments }, 'paper');
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.ettersender,
      },
    ]);
  });

  it('should include the selected answer on old attachment', () => {
    const testComponent = attachmentOld;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: 'leggerVedNaa',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Faktura fra utdanningsinstitusjon',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
    ]);
  });

  it('should use component id when navId is missing', () => {
    const legacyComponent = { ...attachment, id: 'legacy-id', navId: undefined };
    const legacyAttachment = {
      attachmentId: 'legacy-id',
      navId: 'legacy-id',
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    } satisfies SubmissionAttachment;
    const props = createProps(legacyComponent, { attachments: [legacyAttachment] });

    expect(PdfAttachment(props)).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
    ]);
  });

  it('should return null if no attachments match navId', () => {
    const props = createProps(attachment, { attachments: [] });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toBeNull();
  });

  it('should handle multiple attachments when attachment type "other"', () => {
    const testComponent = attachmentOther;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'other',
        value: 'leggerVedNaa',
        files: [],
        title: 'Førerkort',
      },
      {
        attachmentId: `${navId}-1`,
        navId: navId,
        type: 'other',
        value: 'leggerVedNaa',
        title: 'Kursbevis',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Annen dokumentasjon - Førerkort',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
      {
        label: 'Annen dokumentasjon - Kursbevis',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
    ]);
  });

  it('should handle old "other" attachment', () => {
    const testComponent = attachmentOtherOld;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'other',
        value: 'leggerVedNaa',
        files: [],
        title: 'Førerkort',
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Annen dokumentasjon - Førerkort',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
    ]);
  });

  it('should return null when attachment is found but has no value', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: undefined,
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toBeNull();
  });

  it('should return null when attachment type is "other" but no attachments have values', () => {
    const testComponent = attachmentOther;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'other',
        value: undefined,
        files: [],
        title: 'Empty attachment',
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toBeNull();
  });

  it('should return null when submission has no attachments property', () => {
    const props = createProps(attachment, {});
    const pdfFormData = PdfAttachment(props);
    expect(pdfFormData).toBeNull();
  });

  it('should resolve the attachment from the current datagrid row', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const firstRowAttachment: SubmissionAttachment = {
      attachmentId: `${navId}-rows-0-documentation`,
      navId,
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    };
    const secondRowAttachment: SubmissionAttachment = {
      attachmentId: `${navId}-rows-1-documentation`,
      navId,
      type: 'default',
      value: 'ettersender',
      files: [],
    };
    const props = {
      ...createProps(testComponent, {
        data: {
          rows: [{ documentation: firstRowAttachment }, { documentation: secondRowAttachment }],
        },
        attachments: [firstRowAttachment, secondRowAttachment],
      }),
      submissionPath: 'rows[1].documentation',
    };

    expect(PdfAttachment(props)).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.uploadLater,
      },
    ]);
  });

  it('should preserve legacy attachment details when data contains a primitive value', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const legacyAttachment: SubmissionAttachment = {
      attachmentId: navId,
      navId,
      type: 'default',
      value: 'levertTidligere',
      additionalDocumentation: 'Sent last year',
      files: [],
    };
    const props = {
      ...createProps(testComponent, {
        data: { [testComponent.key]: 'ettersender' },
        attachments: [legacyAttachment],
      }),
      submissionPath: testComponent.key,
    };

    expect(PdfAttachment(props)).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.levertTidligere,
      },
      {
        label: 'Når ble dette vedlegget levert?',
        verdiliste: [{ label: 'Sent last year' }],
        visningsVariant: 'PUNKTLISTE',
      },
    ]);
  });

  it('should resolve only the matching legacy attachment for a datagrid row', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const attachments: SubmissionAttachment[] = [
      {
        attachmentId: `${navId}-rows-0-documentation`,
        navId,
        type: 'default',
        value: 'leggerVedNaa',
        files: [],
      },
      {
        attachmentId: `${navId}-rows-1-documentation`,
        navId,
        type: 'default',
        value: 'ettersender',
        files: [],
      },
    ];
    const props = {
      ...createProps(testComponent, {
        data: { rows: [{ documentation: 'leggerVedNaa' }, { documentation: 'ettersender' }] },
        attachments,
      }),
      submissionPath: 'rows[1].documentation',
    };

    expect(PdfAttachment(props)).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.uploadLater,
      },
    ]);
  });

  it('should resolve all matching other attachments for a datagrid row', () => {
    const testComponent = attachmentOther;
    const navId = testComponent.navId!;
    const attachments: SubmissionAttachment[] = [
      {
        attachmentId: `${navId}-rows-0-documentation`,
        navId,
        type: 'other',
        value: 'leggerVedNaa',
        title: 'First row attachment',
        files: [],
      },
      {
        attachmentId: `${navId}-rows-0-documentation-1`,
        navId,
        type: 'other',
        value: 'leggerVedNaa',
        title: 'Second row attachment',
        files: [],
      },
      {
        attachmentId: `${navId}-rows-1-documentation`,
        navId,
        type: 'other',
        value: 'leggerVedNaa',
        title: 'Other row attachment',
        files: [],
      },
    ];
    const props = {
      ...createProps(testComponent, {
        data: { rows: [{ documentation: 'leggerVedNaa' }, { documentation: 'leggerVedNaa' }] },
        attachments,
      }),
      submissionPath: 'rows[0].documentation',
    };

    expect(PdfAttachment(props)).toEqual([
      {
        label: 'Annen dokumentasjon - First row attachment',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
      {
        label: 'Annen dokumentasjon - Second row attachment',
        verdi: TEXTS.statiske.attachment.uploadNow,
      },
    ]);
  });

  it('should not assign an unscoped legacy attachment to an unanswered datagrid row', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const legacyAttachment: SubmissionAttachment = {
      attachmentId: navId,
      navId,
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    };
    const props = {
      ...createProps(testComponent, {
        data: { rows: [{}] },
        attachments: [legacyAttachment],
      }),
      submissionPath: 'rows[0].documentation',
    };

    expect(PdfAttachment(props)).toBeNull();
  });
});
