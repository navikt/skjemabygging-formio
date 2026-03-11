import { featureUtils } from './featureUtils';
const { toFeatureToggles, splitCommaSeparated } = featureUtils;

describe('features', () => {
  describe('splitCommaSeparated', () => {
    it('returns empty array when undefined', () => {
      expect(splitCommaSeparated(undefined)).toEqual([]);
    });

    it('returns empty array when null', () => {
      expect(splitCommaSeparated(null)).toEqual([]);
    });

    it('returns empty array when empty string', () => {
      expect(splitCommaSeparated('')).toEqual([]);
    });

    it('returns single item array for a single value', () => {
      expect(splitCommaSeparated('nav123456')).toEqual(['nav123456']);
    });

    it('splits comma-separated values into an array', () => {
      expect(splitCommaSeparated('nav123456,nav432345,formwithattachments')).toEqual([
        'nav123456',
        'nav432345',
        'formwithattachments',
      ]);
    });

    it('trims whitespace around values', () => {
      expect(splitCommaSeparated(' nav123456 , nav432345 , formwithattachments ')).toEqual([
        'nav123456',
        'nav432345',
        'formwithattachments',
      ]);
    });

    it('filters out empty entries from consecutive commas', () => {
      expect(splitCommaSeparated('nav123456,,nav432345')).toEqual(['nav123456', 'nav432345']);
    });
  });

  describe('toFeatureToggles', () => {
    it('returns empty object when undefined', () => {
      const featureToggles = toFeatureToggles(undefined);
      expect(featureToggles).toEqual({});
    });

    it('returns empty object when empty', () => {
      const featureToggles = toFeatureToggles('');
      expect(featureToggles).toEqual({});
    });

    it('returns empty object when null', () => {
      const featureToggles = toFeatureToggles(null);
      expect(featureToggles).toEqual({});
    });

    it('enables translations', () => {
      const featureToggles = toFeatureToggles('translations');
      expect(featureToggles).toEqual({ enableTranslations: true });
    });

    it('enables translations, foo and bar', () => {
      const featureToggles = toFeatureToggles('translations,foo,bar');
      expect(featureToggles).toEqual({ enableTranslations: true, enableFoo: true, enableBar: true });
    });

    it('trims and enables translations, foo and bar', () => {
      const featureToggles = toFeatureToggles(' translations  , foo,   bar ');
      expect(featureToggles).toEqual({ enableTranslations: true, enableFoo: true, enableBar: true });
    });

    describe('support for enabling and disabling with booleans', () => {
      it('one disable and one enable', () => {
        const featureToggles = toFeatureToggles('translations=false');
        expect(featureToggles).toEqual({ enableTranslations: false });
      });

      it('one disabled, and one defaults to enabled', () => {
        const featureToggles = toFeatureToggles('translations=false');
        expect(featureToggles).toEqual({ enableTranslations: false });
      });

      it('one disabled, one defaults to enabled, and one explicitly enabled', () => {
        const featureToggles = toFeatureToggles('translations=false, diff=true');
        expect(featureToggles).toEqual({ enableTranslations: false, enableDiff: true });
      });

      it('one explicitly enabled with spaces', () => {
        const featureToggles = toFeatureToggles(' diff=true   ');
        expect(featureToggles).toEqual({ enableDiff: true });
      });
    });
  });
});
