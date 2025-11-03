import { Component, Submission, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { FormContextType } from '../../../../context/form/FormContext';
import { LanguageContextType } from '../../../../context/languages/languages-context';
import { PdfComponentProps } from '../../../types';
import PdfAttachmentUpload from './PdfAttachmentUpload';
import { component as attachmentOtherOld } from './testdata/attachment-old-other';
import { component as attachmentOld } from './testdata/attachment-type-and-attachmentValues-missing';
import { component as attachmentOther } from './testdata/attachment-type-other';
import { component as attachment } from './testdata/attachment-with-the-lot';

const createProps = (component: Component, submission: Partial<Submission> = { data: {} }): PdfComponentProps => ({
  formContextValue: {
    submission,
  } as unknown as FormContextType,
  languagesContextValue: {
    translate: (textOrKey) => textOrKey,
  } as LanguageContextType,
  component,
  submissionPath: '',
  componentRegistry: {},
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
    expect(pdfFormData).toEqual({
      label: 'Uttalelse fra lege',
      verdiliste: [
        { label: TEXTS.pdfStatiske.selectedAnswer, verdi: TEXTS.statiske.attachment.levertTidligere },
        { label: 'Når ble dette vedlegget levert?', verdi: submissionAttachments[0].additionalDocumentation },
      ],
    });
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
    expect(pdfFormData).toEqual({
      label: 'Uttalelse fra lege',
      verdiliste: [{ label: TEXTS.pdfStatiske.selectedAnswer, verdi: TEXTS.statiske.attachment.leggerVedNaa }],
    });
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
    expect(pdfFormData).toEqual({
      label: 'Faktura fra utdanningsinstitusjon',
      verdiliste: [{ label: TEXTS.pdfStatiske.selectedAnswer, verdi: TEXTS.statiske.attachment.leggerVedNaa }],
    });
  });

  it('should return null if navId is missing', () => {
    const incompleteComponent = { ...attachment, navId: undefined };
    const props = createProps(incompleteComponent, { attachments: [] });
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toBeNull();
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
    expect(pdfFormData).toEqual({
      label: 'Annen dokumentasjon',
      verdiliste: [
        {
          label: 'Førerkort',
          verdiliste: [{ label: TEXTS.pdfStatiske.selectedAnswer, verdi: TEXTS.statiske.attachment.leggerVedNaa }],
        },
        {
          label: 'Kursbevis',
          verdiliste: [{ label: TEXTS.pdfStatiske.selectedAnswer, verdi: TEXTS.statiske.attachment.leggerVedNaa }],
        },
      ],
    });
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
    expect(pdfFormData).toEqual({
      label: 'Annen dokumentasjon',
      verdiliste: [
        {
          label: 'Førerkort',
          verdiliste: [{ label: TEXTS.pdfStatiske.selectedAnswer, verdi: TEXTS.statiske.attachment.leggerVedNaa }],
        },
      ],
    });
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

  it('should use fallback label when component label is missing', () => {
    const testComponent = { ...attachment, label: undefined };
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
    // @ts-expect-error label will always be present
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData?.label).toBe('Ukjent vedlegg');
  });

  it('should use fallback label for attachment title when title is missing (other type)', () => {
    const testComponent = attachmentOther;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'other',
        value: 'leggerVedNaa',
        files: [],
        title: undefined,
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData?.verdiliste?.[0]?.label).toBe('Ukjent vedlegg');
  });

  it('should filter out attachments without values when type is "other"', () => {
    const testComponent = attachmentOther;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'other',
        value: 'leggerVedNaa',
        files: [],
        title: 'Valid attachment',
      },
      {
        attachmentId: `${navId}-1`,
        navId: navId,
        type: 'other',
        value: undefined,
        files: [],
        title: 'Empty attachment',
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData?.verdiliste).toHaveLength(1);
    expect(pdfFormData?.verdiliste?.[0]?.label).toBe('Valid attachment');
  });

  it('should not include comment when additional documentation is enabled but not provided', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: 'levertTidligere',
        additionalDocumentation: '',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData?.verdiliste).toHaveLength(2);
    // @ts-expect-error typer for familie-pdf skal flyttes til shared-domain
    expect(pdfFormData?.verdiliste?.[1]?.verdi).toBe('');
  });

  it('should not include comment section when additional documentation is not enabled', () => {
    const testComponent = attachment;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: navId,
        navId: navId,
        type: 'default',
        value: 'leggerVedNaa',
        additionalDocumentation: 'Should not appear',
        files: [],
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData?.verdiliste).toHaveLength(1);
  });

  it('should match attachments by navId prefix for "other" type', () => {
    const testComponent = attachmentOther;
    const navId = testComponent.navId!;
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: `${navId}-custom-suffix`,
        navId: navId,
        type: 'other',
        value: 'leggerVedNaa',
        files: [],
        title: 'Custom attachment',
      },
    ];
    const props = createProps(testComponent, { attachments: submissionAttachments });
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData?.verdiliste).toHaveLength(1);
    expect(pdfFormData?.verdiliste?.[0]?.label).toBe('Custom attachment');
  });

  it('should return null when submission has no attachments property', () => {
    const props = createProps(attachment, {});
    const pdfFormData = PdfAttachmentUpload(props);
    expect(pdfFormData).toBeNull();
  });
});
