import {
  GlobalTranslationsResourceContent,
  PublishedTranslations,
  TranslationResource,
} from '@navikt/skjemadigitalisering-shared-domain';

// We need to map to this deprecated format as long as we still use gitHub for publishing. When published translations are collected from forms-api this can be removed.
// Note that tag here is not used, as it is superfluous. All tags have been combined into one, named 'dummy-tag'
const mapGlobalToFormioFormat = ({ translations }: PublishedTranslations): GlobalTranslationsResourceContent => {
  const resourceDefaults: Pick<TranslationResource, 'id' | 'name' | 'scope' | 'tag'> = {
    id: '',
    name: 'global',
    scope: 'global',
    tag: 'dummy-tag',
  };
  const populateWithScope = (
    translationRecord: Record<string, string>,
  ): Record<string, { value: string; scope: 'global' }> =>
    Object.entries(translationRecord)?.reduce(
      (acc, [key, value]) => ({ ...acc, [key]: { value, scope: 'global' } }),
      {},
    );
  return {
    en: [{ ...resourceDefaults, translations: populateWithScope(translations.en ?? {}) }],
    'nn-NO': [{ ...resourceDefaults, translations: populateWithScope(translations.nn ?? {}) }],
  };
};

export { mapGlobalToFormioFormat };
