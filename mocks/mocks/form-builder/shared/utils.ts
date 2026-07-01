import globalTranslations from '../../data/forms-api/global-translations.json';

const generateId = () => {
  return String(Math.floor(Math.random() * 2147483647));
};

const sanitizeAndLowerCase = (value?: string) => {
  if (!value) return '';

  return value
    .toLowerCase()
    .replace(/[\s.()/]/g, '')
    .replace('æ', 'ae')
    .replace('ø', 'o')
    .replace('å', 'a');
};

const insertLanguage = (value: string, language: string) => {
  const regex = /(<\/[^>]+>$)/;
  if (regex.test(value)) {
    return value.replace(regex, ` (${language})$1`);
  }
  return `${value} (${language})`;
};

type SupportedLanguage = 'nb' | 'nn' | 'en';

type GlobalTranslationEntry = {
  key: string;
  nb?: string;
  nn?: string;
  en?: string;
};

const globalTranslationMap = new Map(
  (globalTranslations as GlobalTranslationEntry[]).map((entry) => [entry.key, entry]),
);

const getTranslationValue = (value: string, language: string) => {
  const supportedLanguage = language as SupportedLanguage;
  const translatedValue = globalTranslationMap.get(value)?.[supportedLanguage];
  return translatedValue || insertLanguage(value, language);
};

const getMockTranslationsFromForm = (form: any, language: string = 'en') => {
  return {
    _id: generateId(),
    data: {
      scope: 'local',
      form: form.title,
      language,
      i18n: {
        [form.title]: `${form.title} (${language})`,
        ...getMockTranslationsFromComponents(form.components, language),
      },
    },
  };
};

const getMockTranslationsFromComponents = (components: any[], language: string) => {
  return components.reduce((translations: Record<string, string>, component) => {
    if (component.title) {
      translations[component.title] = getTranslationValue(component.title, language);
    }
    if (component.label) {
      translations[component.label] = getTranslationValue(component.label, language);
    }
    if (component.legend) {
      translations[component.legend] = getTranslationValue(component.legend, language);
    }
    if (component.description) {
      translations[component.description] = getTranslationValue(component.description, language);
    }
    if (component.additionalDescriptionText) {
      translations[component.additionalDescriptionText] = getTranslationValue(
        component.additionalDescriptionText,
        language,
      );
    }
    if (component.content) {
      translations[component.content] = getTranslationValue(component.content, language);
    }
    if (component.additionalDescriptionLabel) {
      translations[component.additionalDescriptionLabel] = getTranslationValue(
        component.additionalDescriptionLabel,
        language,
      );
    }
    if (component.rowTitle) {
      translations[component.rowTitle] = getTranslationValue(component.rowTitle, language);
    }
    if (component.addAnother) {
      translations[component.addAnother] = getTranslationValue(component.addAnother, language);
    }
    if (component.removeAnother) {
      translations[component.removeAnother] = getTranslationValue(component.removeAnother, language);
    }
    if (component.customLabels) {
      Object.values(component.customLabels).forEach((value) => {
        if (typeof value === 'string' && value) {
          translations[value] = getTranslationValue(value, language);
        }
      });
    }
    if (component.values) {
      component.values.forEach((value: any) => {
        if (value.label) {
          translations[value.label] = getTranslationValue(value.label, language);
        }
        if (value.description) {
          translations[value.description] = getTranslationValue(value.description, language);
        }
      });
    }

    if (component.components) {
      return {
        ...translations,
        ...getMockTranslationsFromComponents(component.components, language),
      };
    }

    return translations;
  }, {});
};

export { generateId, getMockTranslationsFromForm, sanitizeAndLowerCase };
