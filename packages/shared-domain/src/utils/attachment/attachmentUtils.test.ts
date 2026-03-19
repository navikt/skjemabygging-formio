import {
  AttachmentSettingValues,
  Component,
  NavFormType,
  SubmissionAttachmentValue,
  TEXTS,
  attachmentUtils,
} from '../../index';

const translate = (text: string) => text;

const createForm = (): NavFormType => ({
  tags: [],
  type: 'form',
  display: 'form',
  name: 'test-form',
  title: 'Test form',
  path: 'test-form',
  properties: {
    skjemanummer: 'NAV 00-00.00',
    tema: 'TEST',
    submissionTypes: [],
    subsequentSubmissionTypes: [],
  },
  components: [],
});

describe('attachmentUtils', () => {
  describe('getAttachmentOptionLabel', () => {
    it('returns digital labels for mapped keys when submission method is digital', () => {
      expect(attachmentUtils.getAttachmentOptionLabel('leggerVedNaa', 'digital')).toBe(
        TEXTS.statiske.attachment.digitalRadioOptions.lasterOppNaa,
      );
      expect(attachmentUtils.getAttachmentOptionLabel('ettersender', 'digital')).toBe(
        TEXTS.statiske.attachment.digitalRadioOptions.sendSenere,
      );
    });

    it('falls back to existing labels for keys without digital mapping', () => {
      expect(attachmentUtils.getAttachmentOptionLabel('nei', 'digital')).toBe(TEXTS.statiske.attachment.nei);
    });

    it('returns expected labels for paper, digitalnologin and undefined', () => {
      expect(attachmentUtils.getAttachmentOptionLabel('ettersender', 'paper')).toBe(
        TEXTS.statiske.attachment.ettersender,
      );
      expect(attachmentUtils.getAttachmentOptionLabel('ettersender', 'digitalnologin')).toBe(
        TEXTS.statiske.attachment.digitalRadioOptions.sendSenere,
      );
      expect(attachmentUtils.getAttachmentOptionLabel('ettersender')).toBe(TEXTS.statiske.attachment.ettersender);
    });
  });

  describe('mapKeysToOptions', () => {
    const attachmentValues: AttachmentSettingValues = {
      leggerVedNaa: { enabled: true },
      ettersender: { enabled: true },
      nei: { enabled: true },
    };

    it('maps attachment values to digital labels when submission method is digital', () => {
      const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate, 'digital');

      expect(options).toEqual([
        {
          value: 'leggerVedNaa',
          label: TEXTS.statiske.attachment.digitalRadioOptions.lasterOppNaa,
          upload: true,
        },
        {
          value: 'ettersender',
          label: TEXTS.statiske.attachment.digitalRadioOptions.sendSenere,
          upload: false,
        },
        {
          value: 'nei',
          label: TEXTS.statiske.attachment.nei,
          upload: false,
        },
      ]);
    });

    it('maps attachment values to existing labels for non-digital submissions', () => {
      const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate, 'paper');

      expect(options[0].label).toBe(TEXTS.statiske.attachment.leggerVedNaa);
      expect(options[1].label).toBe(TEXTS.statiske.attachment.ettersender);
    });

    it('maps attachment values to digital labels when submission method is digitalnologin', () => {
      const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate, 'digitalnologin');

      expect(options[0].label).toBe(TEXTS.statiske.attachment.digitalRadioOptions.lasterOppNaa);
      expect(options[1].label).toBe(TEXTS.statiske.attachment.digitalRadioOptions.sendSenere);
    });
  });

  describe('mapToAttachmentSummary', () => {
    const form = createForm();
    const component: Component = {
      key: 'attachment',
      label: 'Attachment',
      type: 'attachment',
      attachmentValues: {
        ettersender: { enabled: true },
      },
    };
    const value: SubmissionAttachmentValue = { key: 'ettersender' };

    it('uses digital labels for summary descriptions when submission method is digital', () => {
      const summary = attachmentUtils.mapToAttachmentSummary({
        translate,
        value,
        component,
        form,
        submissionMethod: 'digital',
      });

      expect(summary.description).toBe(TEXTS.statiske.attachment.digitalRadioOptions.sendSenere);
    });

    it('uses existing labels for summary descriptions for non-digital submissions', () => {
      const summary = attachmentUtils.mapToAttachmentSummary({
        translate,
        value,
        component,
        form,
        submissionMethod: 'paper',
      });

      expect(summary.description).toBe(TEXTS.statiske.attachment.ettersender);
    });

    it('uses digital labels for summary descriptions when submission method is digitalnologin', () => {
      const summary = attachmentUtils.mapToAttachmentSummary({
        translate,
        value,
        component,
        form,
        submissionMethod: 'digitalnologin',
      });

      expect(summary.description).toBe(TEXTS.statiske.attachment.digitalRadioOptions.sendSenere);
    });
  });
});
