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

  it('should return null if navId is missing', () => {
    const incompleteComponent = { ...attachment, navId: undefined };
    const props = createProps(incompleteComponent, { attachments: [] });
    expect(() => PdfAttachment(props)).toThrow('PdfAttachment: navId is required on digital attachment');
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
});
