import {
  FormsApiGlobalTranslation,
  GlobalTranslationsResourceContent,
  TranslationResource,
} from '@navikt/skjemadigitalisering-shared-domain';

const mapGlobalToFormioFormat = (translations: FormsApiGlobalTranslation[]): GlobalTranslationsResourceContent => {
  const initTags = { skjematekster: {}, grensesnitt: {}, validering: {}, 'statiske-tekster': {} };
  const accumulated = translations.reduce(
    (acc, { key, en, nn, tag }) => {
      const resultEn = { value: en, scope: 'global' };
      const resultNn = { value: nn, scope: 'global' };
      return {
        ...acc,
        en: { ...acc.en, [tag]: { ...acc.en[tag], [key]: resultEn } },
        nn: { ...acc.nn, [tag]: { ...acc.nn[tag], [key]: resultNn } },
      };
    },
    { en: { ...initTags }, nn: { ...initTags } },
  );
  const resourceDefaults: Pick<TranslationResource, 'id' | 'name' | 'scope'> = {
    id: '',
    name: 'global',
    scope: 'global',
  };

  return {
    en: [
      { ...resourceDefaults, tag: 'skjematekster', translations: accumulated.en.skjematekster },
      { ...resourceDefaults, tag: 'grensesnitt', translations: accumulated.en.grensesnitt },
      { ...resourceDefaults, tag: 'validering', translations: accumulated.en.validering },
      { ...resourceDefaults, tag: 'statiske-tekster', translations: accumulated.en['statiske-tekster'] },
    ],
    'nn-NO': [
      { ...resourceDefaults, tag: 'skjematekster', translations: accumulated.nn.skjematekster },
      { ...resourceDefaults, tag: 'grensesnitt', translations: accumulated.nn.grensesnitt },
      { ...resourceDefaults, tag: 'validering', translations: accumulated.nn.validering },
      { ...resourceDefaults, tag: 'statiske-tekster', translations: accumulated.nn['statiske-tekster'] },
    ],
    'nb-NO': [],
  };
};

export { mapGlobalToFormioFormat };
