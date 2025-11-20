import { Component, Submission, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import PdfAttachmentUpload from './PdfAttachmentUpload';
import { component as attachmentOtherOld } from './testdata/attachment-old-other';
import { component as attachmentOld } from './testdata/attachment-type-and-attachmentValues-missing';
import { component as attachmentOther } from './testdata/attachment-type-other';
import { component as attachment } from './testdata/attachment-with-the-lot';

const createProps = (component: Component, submission: Partial<Submission> = { data: {} }): PdfComponentProps => ({
  submission: submission as Submission,
  translate: (textOrKey?: string) => textOrKey!,
  component,
  submissionPath: '',
  componentRegistry: {},
  currentLanguage: 'nb',
});

describe('PdfAttachmentUpload', () => {
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
    const pdfFormData = PdfAttachmentUpload(props);
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
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Uttalelse fra lege',
        verdi: TEXTS.statiske.attachment.leggerVedNaa,
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
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Faktura fra utdanningsinstitusjon',
        verdi: TEXTS.statiske.attachment.leggerVedNaa,
      },
    ]);
  });

  it('should return null if navId is missing', () => {
    const incompleteComponent = { ...attachment, navId: undefined };
    const props = createProps(incompleteComponent, { attachments: [] });
    expect(() => PdfAttachmentUpload(props)).toThrow('PdfAttachmentUpload: navId is required on component');
  });

  it('should return null if no attachments match navId', () => {
    const props = createProps(attachment, { attachments: [] });
    const pdfFormData = PdfAttachmentUpload(props);
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
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Annen dokumentasjon - Førerkort',
        verdi: TEXTS.statiske.attachment.leggerVedNaa,
      },
      {
        label: 'Annen dokumentasjon - Kursbevis',
        verdi: TEXTS.statiske.attachment.leggerVedNaa,
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
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toEqual([
      {
        label: 'Annen dokumentasjon - Førerkort',
        verdi: TEXTS.statiske.attachment.leggerVedNaa,
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
    const pdfFormData = PdfAttachmentUpload(props);
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
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toBeNull();
  });

  it('should return null when submission has no attachments property', () => {
    const props = createProps(attachment, {});
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toBeNull();
  });
});
