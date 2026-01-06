const generateId = () => {
  return String(Math.floor(Math.random() * 2147483647));
};

const sanitizeAndLowerCase = (value?: string) => {
  if (!value) return '';

  return value.toLowerCase().replace(/[\s()/]/g, '');
};

const insertLanguage = (value: string, language: string) => {
  const regex = /(<\/[^>]+>$)/;
  if (regex.test(value)) {
    return value.replace(regex, ` (${language})$1`);
  }
  return `${value} (${language})`;
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
      translations[component.title] = insertLanguage(component.title, language);
    }
    if (component.label) {
      translations[component.label] = insertLanguage(component.label, language);
    }
    if (component.legend) {
      translations[component.legend] = insertLanguage(component.legend, language);
    }
    if (component.description) {
      translations[component.description] = insertLanguage(component.description, language);
    }
    if (component.additionalDescriptionText) {
      translations[component.additionalDescriptionText] = insertLanguage(component.additionalDescriptionText, language);
    }
    if (component.additionalDescriptionLabel) {
      translations[component.additionalDescriptionLabel] = insertLanguage(
        component.additionalDescriptionLabel,
        language,
      );
    }
    if (component.values) {
      component.values.forEach((value: any) => {
        if (value.label) {
          translations[value.label] = insertLanguage(value.label, language);
        }
        if (value.description) {
          translations[value.description] = insertLanguage(value.description, language);
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
