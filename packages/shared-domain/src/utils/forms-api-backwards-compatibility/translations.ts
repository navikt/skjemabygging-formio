import { TranslationResource } from '../../languages/types';
import { GlobalTranslationsResourceContent } from '../../resource/published';
import { PublishedTranslations } from '../../translations/FormsApiTranslation';

const populateWithScope = (
  translationRecord: Record<string, string>,
): Record<string, { value: string; scope: 'global' }> =>
  Object.entries(translationRecord)?.reduce((acc, [key, value]) => ({ ...acc, [key]: { value, scope: 'global' } }), {});

const mapPublishedGlobalTranslationsToFormioFormat = ({
  translations,
}: PublishedTranslations): GlobalTranslationsResourceContent => {
  const resourceDefaults: Pick<TranslationResource, 'id' | 'name' | 'scope' | 'tag'> = {
    id: '',
    name: 'global',
    scope: 'global',
    tag: 'dummy-tag',
  };
  return {
    'nb-NO': [{ ...resourceDefaults, translations: populateWithScope(translations.nb ?? {}) }],
    'nn-NO': [{ ...resourceDefaults, translations: populateWithScope(translations.nn ?? {}) }],
    en: [{ ...resourceDefaults, translations: populateWithScope(translations.en ?? {}) }],
  };
};

export { mapPublishedGlobalTranslationsToFormioFormat };
