import { FormsApiTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
// The package's Node entry requires every locale dynamically, which breaks when the backends bundle it.
import countries from 'i18n-iso-countries/index.js';
import enLocale from 'i18n-iso-countries/langs/en.json';
import nbLocale from 'i18n-iso-countries/langs/nb.json';
import nnLocale from 'i18n-iso-countries/langs/nn.json';

let countryNameTranslations: FormsApiTranslationMap | undefined;

const createCountryNameTranslations = (): FormsApiTranslationMap => {
  [nbLocale, nnLocale, enLocale].forEach((locale) => countries.registerLocale(locale));
  const nnNames = countries.getNames('nn');
  const enNames = countries.getNames('en');

  return Object.entries(countries.getNames('nb')).reduce<FormsApiTranslationMap>((translations, [code, nb]) => {
    translations[nb] = { nb, nn: nnNames[code], en: enNames[code] };
    return translations;
  }, {});
};

// Form authors write country names in Bokmål, so the Bokmål name is the translation key.
const getCountryNameTranslations = (): FormsApiTranslationMap => {
  countryNameTranslations ??= createCountryNameTranslations();
  return countryNameTranslations;
};

export { getCountryNameTranslations };
