import { Form, FormPropertiesType, mockedComponentObjectForTest } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ATTACHMENTS_ERROR_MESSAGE,
  getPaperNoCoverPageErrorMessage,
  getPublishValidationMessage,
  validateAttachments,
} from './publishValidationUtils';

const { createDummyAttachment, createFormsApiFormObject, createPanelObject } = mockedComponentObjectForTest;

const ERROR_MESSAGE_MISSING_INNSENDING_OVERSKRIFT =
  'Du må fylle ut «Overskrift til innsending» under skjemainnstillinger før skjemaet kan publiseres.';
const ERROR_MESSAGE_MISSING_INNSENDING_FORKLARING =
  'Du må fylle ut «Forklaring til innsending» under skjemainnstillinger før skjemaet kan publiseres.';
const ERROR_MESSAGE_MISSING_INNSENDING_FIELDS =
  'Du må fylle ut «Overskrift til innsending» og «Forklaring til innsending» under skjemainnstillinger før skjemaet kan publiseres.';

type AttachmentProperties = {
  vedleggskode?: string;
  vedleggstittel?: string;
};

const createFormWithAttachment = (attachmentProperties: AttachmentProperties): Form =>
  createFormsApiFormObject(
    [createPanelObject('Personinformasjon', [createDummyAttachment('Bekreftelse fra skole', attachmentProperties)])],
    'Veiledning',
  );

const createFormWithProperties = (properties: Partial<FormPropertiesType> = {}): Form => {
  const form = createFormsApiFormObject([], 'Veiledning');

  return {
    ...form,
    properties: {
      ...form.properties,
      ...properties,
    },
  };
};

describe('publishValidationUtils', () => {
  describe('validateAttachments', () => {
    it('returns true when the form has no attachments', () => {
      expect(validateAttachments(createFormWithProperties())).toBe(true);
    });

    it('returns true when attachment metadata is complete', () => {
      expect(
        validateAttachments(
          createFormWithAttachment({
            vedleggskode: 'B1',
            vedleggstittel: 'Bekreftelse fra skole',
          }),
        ),
      ).toBe(true);
    });

    it('preserves the current behavior for whitespace-only attachment metadata', () => {
      expect(
        validateAttachments(
          createFormWithAttachment({
            vedleggskode: ' ',
            vedleggstittel: ' ',
          }),
        ),
      ).toBe(true);
    });

    it('returns false when vedleggskode is missing', () => {
      expect(
        validateAttachments(
          createFormWithAttachment({
            vedleggskode: '',
            vedleggstittel: 'Bekreftelse fra skole',
          }),
        ),
      ).toBe(false);
    });

    it('returns false when vedleggstittel is missing', () => {
      expect(
        validateAttachments(
          createFormWithAttachment({
            vedleggskode: 'B1',
            vedleggstittel: '',
          }),
        ),
      ).toBe(false);
    });

    it('returns false when both attachment fields are missing', () => {
      expect(
        validateAttachments(
          createFormWithAttachment({
            vedleggskode: '',
            vedleggstittel: '',
          }),
        ),
      ).toBe(false);
    });
  });

  describe('getPaperNoCoverPageErrorMessage', () => {
    it('returns undefined when submissionTypes are missing', () => {
      expect(
        getPaperNoCoverPageErrorMessage(
          createFormWithProperties({
            submissionTypes: undefined,
            innsendingOverskrift: '',
            innsendingForklaring: '',
          }),
        ),
      ).toBeUndefined();
    });

    it('returns undefined when the submission type is not paper-no-cover-page', () => {
      expect(
        getPaperNoCoverPageErrorMessage(
          createFormWithProperties({
            submissionTypes: ['DIGITAL'],
            innsendingOverskrift: '',
            innsendingForklaring: '',
          }),
        ),
      ).toBeUndefined();
    });

    it('returns undefined when paper-no-cover-page metadata is complete', () => {
      expect(
        getPaperNoCoverPageErrorMessage(
          createFormWithProperties({
            submissionTypes: [],
            innsendingOverskrift: 'Skriv ut skjemaet',
            innsendingForklaring: 'Gi skjemaet til pasienten',
          }),
        ),
      ).toBeUndefined();
    });

    it('returns an error when innsendingOverskrift is missing', () => {
      expect(
        getPaperNoCoverPageErrorMessage(
          createFormWithProperties({
            submissionTypes: [],
            innsendingOverskrift: '',
            innsendingForklaring: 'Gi skjemaet til pasienten',
          }),
        ),
      ).toBe(ERROR_MESSAGE_MISSING_INNSENDING_OVERSKRIFT);
    });

    it('returns an error when innsendingForklaring is missing', () => {
      expect(
        getPaperNoCoverPageErrorMessage(
          createFormWithProperties({
            submissionTypes: [],
            innsendingOverskrift: 'Skriv ut skjemaet',
            innsendingForklaring: '',
          }),
        ),
      ).toBe(ERROR_MESSAGE_MISSING_INNSENDING_FORKLARING);
    });

    it('treats whitespace-only paper-no-cover-page metadata as missing', () => {
      expect(
        getPaperNoCoverPageErrorMessage(
          createFormWithProperties({
            submissionTypes: [],
            innsendingOverskrift: '   ',
            innsendingForklaring: '   ',
          }),
        ),
      ).toBe(ERROR_MESSAGE_MISSING_INNSENDING_FIELDS);
    });
  });

  describe('getPublishValidationMessage', () => {
    it('returns undefined when the form has no publish blockers', () => {
      const form = createFormWithAttachment({
        vedleggskode: 'B1',
        vedleggstittel: 'Bekreftelse fra skole',
      });
      form.properties = {
        ...form.properties,
        submissionTypes: ['DIGITAL'],
        innsendingOverskrift: '',
        innsendingForklaring: '',
      };

      expect(getPublishValidationMessage(form)).toBeUndefined();
    });

    it('returns the attachment blocker when attachment metadata is incomplete', () => {
      expect(
        getPublishValidationMessage(
          createFormWithAttachment({
            vedleggskode: '',
            vedleggstittel: 'Bekreftelse fra skole',
          }),
        ),
      ).toBe(ATTACHMENTS_ERROR_MESSAGE);
    });

    it('returns the paper-no-cover-page blocker when metadata is incomplete', () => {
      expect(
        getPublishValidationMessage(
          createFormWithProperties({
            submissionTypes: [],
            innsendingOverskrift: '',
            innsendingForklaring: 'Gi skjemaet til pasienten',
          }),
        ),
      ).toBe(ERROR_MESSAGE_MISSING_INNSENDING_OVERSKRIFT);
    });

    it('returns both blockers separated by a single space when the form has multiple publish blockers', () => {
      const form = createFormWithAttachment({
        vedleggskode: '',
        vedleggstittel: 'Bekreftelse fra skole',
      });
      form.properties = {
        ...form.properties,
        submissionTypes: [],
        innsendingOverskrift: '',
        innsendingForklaring: '',
      };

      expect(getPublishValidationMessage(form)).toBe(
        `${ATTACHMENTS_ERROR_MESSAGE} ${ERROR_MESSAGE_MISSING_INNSENDING_FIELDS}`,
      );
    });
  });
});
