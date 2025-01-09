import {
  GlobalTranslationsResourceContent,
  PublishedTranslations,
  TranslationResource,
} from '@navikt/skjemadigitalisering-shared-domain';

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
