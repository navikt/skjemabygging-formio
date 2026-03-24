import { TEXTS } from '../../texts';
import { attachmentUtils } from './attachmentUtils';

describe('attachmentUtils', () => {
  describe('resolveAttachmentLabelKey', () => {
    it('uses digital label keys for digital submission method', () => {
      expect(attachmentUtils.resolveAttachmentLabelKey('leggerVedNaa', 'digital')).toBe('uploadNow');
      expect(attachmentUtils.resolveAttachmentLabelKey('ettersender', 'digital')).toBe('uploadLater');
      expect(attachmentUtils.resolveAttachmentLabelKey('levertTidligere', 'digital')).toBe('alreadySent');
      expect(attachmentUtils.resolveAttachmentLabelKey('harIkke', 'digital')).toBe('dontHave');
      expect(attachmentUtils.resolveAttachmentLabelKey('andre', 'digital')).toBe('other');
      expect(attachmentUtils.resolveAttachmentLabelKey('nav', 'digital')).toBe('navWillFetch');
      expect(attachmentUtils.resolveAttachmentLabelKey('nei', 'digital')).toBe('noAdditionalAttachments');
    });

    it('uses digital label keys for digitalnologin submission method', () => {
      expect(attachmentUtils.resolveAttachmentLabelKey('leggerVedNaa', 'digitalnologin')).toBe('uploadNow');
      expect(attachmentUtils.resolveAttachmentLabelKey('ettersender', 'digitalnologin')).toBe('uploadLater');
      expect(attachmentUtils.resolveAttachmentLabelKey('levertTidligere', 'digitalnologin')).toBe('alreadySent');
      expect(attachmentUtils.resolveAttachmentLabelKey('harIkke', 'digitalnologin')).toBe('dontHave');
      expect(attachmentUtils.resolveAttachmentLabelKey('andre', 'digitalnologin')).toBe('other');
      expect(attachmentUtils.resolveAttachmentLabelKey('nav', 'digitalnologin')).toBe('navWillFetch');
      expect(attachmentUtils.resolveAttachmentLabelKey('nei', 'digitalnologin')).toBe('noAdditionalAttachments');
    });

    it('keeps legacy keys for paper and undefined submission method', () => {
      expect(attachmentUtils.resolveAttachmentLabelKey('leggerVedNaa', 'paper')).toBe('leggerVedNaa');
      expect(attachmentUtils.resolveAttachmentLabelKey('ettersender', 'paper')).toBe('ettersender');
      expect(attachmentUtils.resolveAttachmentLabelKey('levertTidligere', 'paper')).toBe('levertTidligere');
      expect(attachmentUtils.resolveAttachmentLabelKey('harIkke', 'paper')).toBe('harIkke');
      expect(attachmentUtils.resolveAttachmentLabelKey('andre', 'paper')).toBe('andre');
      expect(attachmentUtils.resolveAttachmentLabelKey('nav', 'paper')).toBe('nav');
      expect(attachmentUtils.resolveAttachmentLabelKey('nei', 'paper')).toBe('nei');

      expect(attachmentUtils.resolveAttachmentLabelKey('leggerVedNaa')).toBe('leggerVedNaa');
      expect(attachmentUtils.resolveAttachmentLabelKey('ettersender')).toBe('ettersender');
      expect(attachmentUtils.resolveAttachmentLabelKey('levertTidligere')).toBe('levertTidligere');
      expect(attachmentUtils.resolveAttachmentLabelKey('harIkke')).toBe('harIkke');
      expect(attachmentUtils.resolveAttachmentLabelKey('andre')).toBe('andre');
      expect(attachmentUtils.resolveAttachmentLabelKey('nav')).toBe('nav');
      expect(attachmentUtils.resolveAttachmentLabelKey('nei')).toBe('nei');
    });
  });

  describe('getAttachmentLabel', () => {
    it('returns configured digital texts for digital and digitalnologin', () => {
      expect(attachmentUtils.getAttachmentLabel('leggerVedNaa', 'digital')).toBe(TEXTS.statiske.attachment.uploadNow);
      expect(attachmentUtils.getAttachmentLabel('ettersender', 'digital')).toBe(TEXTS.statiske.attachment.uploadLater);
      expect(attachmentUtils.getAttachmentLabel('levertTidligere', 'digital')).toBe(
        TEXTS.statiske.attachment.alreadySent,
      );
      expect(attachmentUtils.getAttachmentLabel('harIkke', 'digital')).toBe(TEXTS.statiske.attachment.dontHave);
      expect(attachmentUtils.getAttachmentLabel('andre', 'digital')).toBe(TEXTS.statiske.attachment.other);
      expect(attachmentUtils.getAttachmentLabel('nav', 'digital')).toBe(TEXTS.statiske.attachment.navWillFetch);

      expect(attachmentUtils.getAttachmentLabel('leggerVedNaa', 'digitalnologin')).toBe(
        TEXTS.statiske.attachment.uploadNow,
      );
    });

    it('returns legacy texts for paper', () => {
      expect(attachmentUtils.getAttachmentLabel('leggerVedNaa', 'paper')).toBe(TEXTS.statiske.attachment.leggerVedNaa);
      expect(attachmentUtils.getAttachmentLabel('ettersender', 'paper')).toBe(TEXTS.statiske.attachment.ettersender);
      expect(attachmentUtils.getAttachmentLabel('levertTidligere', 'paper')).toBe(
        TEXTS.statiske.attachment.levertTidligere,
      );
      expect(attachmentUtils.getAttachmentLabel('harIkke', 'paper')).toBe(TEXTS.statiske.attachment.harIkke);
      expect(attachmentUtils.getAttachmentLabel('andre', 'paper')).toBe(TEXTS.statiske.attachment.andre);
      expect(attachmentUtils.getAttachmentLabel('nav', 'paper')).toBe(TEXTS.statiske.attachment.nav);
    });
  });

  describe('mapKeysToOptions', () => {
    const translate = (text: string) => text;

    it('maps attachment values with digital labels when submission method is digital', () => {
      const options = attachmentUtils.mapKeysToOptions(
        {
          leggerVedNaa: { enabled: true },
          ettersender: { enabled: true },
          levertTidligere: { enabled: true },
          harIkke: { enabled: true },
          andre: { enabled: true },
          nav: { enabled: true },
        },
        translate,
        'digital',
      );

      expect(options).toEqual([
        { value: 'leggerVedNaa', label: TEXTS.statiske.attachment.uploadNow, upload: true },
        { value: 'ettersender', label: TEXTS.statiske.attachment.uploadLater, upload: false },
        { value: 'levertTidligere', label: TEXTS.statiske.attachment.alreadySent, upload: false },
        { value: 'harIkke', label: TEXTS.statiske.attachment.dontHave, upload: false },
        { value: 'andre', label: TEXTS.statiske.attachment.other, upload: false },
        { value: 'nav', label: TEXTS.statiske.attachment.navWillFetch, upload: false },
      ]);
    });

    it('maps attachment values with legacy labels when submission method is paper', () => {
      const options = attachmentUtils.mapKeysToOptions(
        {
          leggerVedNaa: { enabled: true },
          ettersender: { enabled: true },
          levertTidligere: { enabled: true },
          harIkke: { enabled: true },
          andre: { enabled: true },
          nav: { enabled: true },
        },
        translate,
        'paper',
      );

      expect(options).toEqual([
        { value: 'leggerVedNaa', label: TEXTS.statiske.attachment.leggerVedNaa, upload: true },
        { value: 'ettersender', label: TEXTS.statiske.attachment.ettersender, upload: false },
        { value: 'levertTidligere', label: TEXTS.statiske.attachment.levertTidligere, upload: false },
        { value: 'harIkke', label: TEXTS.statiske.attachment.harIkke, upload: false },
        { value: 'andre', label: TEXTS.statiske.attachment.andre, upload: false },
        { value: 'nav', label: TEXTS.statiske.attachment.nav, upload: false },
      ]);
    });
  });

  describe('isSingleUploadOnlyOption', () => {
    const uploadOnlyValues = {
      leggerVedNaa: { enabled: true },
      ettersender: { enabled: false },
      levertTidligere: { enabled: false },
      harIkke: { enabled: false },
      andre: { enabled: false },
      nav: { enabled: false },
      nei: { enabled: false },
    };

    it('returns true for digital with only leggerVedNaa enabled', () => {
      expect(attachmentUtils.isSingleUploadOnlyOption(uploadOnlyValues, 'digital')).toBe(true);
    });

    it('returns true for digitalnologin with only leggerVedNaa enabled', () => {
      expect(attachmentUtils.isSingleUploadOnlyOption(uploadOnlyValues, 'digitalnologin')).toBe(true);
    });

    it('returns false for paper even with only leggerVedNaa enabled', () => {
      expect(attachmentUtils.isSingleUploadOnlyOption(uploadOnlyValues, 'paper')).toBe(false);
    });

    it('returns false when more than one option is enabled', () => {
      expect(
        attachmentUtils.isSingleUploadOnlyOption(
          {
            ...uploadOnlyValues,
            ettersender: { enabled: true },
          },
          'digital',
        ),
      ).toBe(false);
    });

    it('returns false when single enabled option is not leggerVedNaa', () => {
      expect(
        attachmentUtils.isSingleUploadOnlyOption(
          {
            ...uploadOnlyValues,
            leggerVedNaa: { enabled: false },
            ettersender: { enabled: true },
          },
          'digital',
        ),
      ).toBe(false);
    });

    it('supports array based options and returns true only when single leggerVedNaa option is present', () => {
      expect(
        attachmentUtils.isSingleUploadOnlyOption([{ value: 'leggerVedNaa', label: 'Upload now' }], 'digital'),
      ).toBe(true);
      expect(
        attachmentUtils.isSingleUploadOnlyOption(
          [
            { value: 'leggerVedNaa', label: 'Upload now' },
            { value: 'ettersender', label: 'Upload later' },
          ],
          'digital',
        ),
      ).toBe(false);
    });
  });

  describe('getImplicitAttachmentValueForUploadOnly', () => {
    const uploadOnlyValues = {
      leggerVedNaa: { enabled: true },
      ettersender: { enabled: false },
      levertTidligere: { enabled: false },
      harIkke: { enabled: false },
      andre: { enabled: false },
      nav: { enabled: false },
      nei: { enabled: false },
    };

    it('returns leggerVedNaa for digital upload-only mode', () => {
      expect(attachmentUtils.getImplicitAttachmentValueForUploadOnly(uploadOnlyValues, 'digital')).toBe('leggerVedNaa');
    });

    it('returns leggerVedNaa for digitalnologin upload-only mode', () => {
      expect(attachmentUtils.getImplicitAttachmentValueForUploadOnly(uploadOnlyValues, 'digitalnologin')).toBe(
        'leggerVedNaa',
      );
    });

    it('returns undefined outside upload-only mode', () => {
      expect(attachmentUtils.getImplicitAttachmentValueForUploadOnly(uploadOnlyValues, 'paper')).toBeUndefined();
      expect(
        attachmentUtils.getImplicitAttachmentValueForUploadOnly(
          {
            ...uploadOnlyValues,
            ettersender: { enabled: true },
          },
          'digital',
        ),
      ).toBeUndefined();
    });
  });
});
