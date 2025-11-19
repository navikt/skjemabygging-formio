const generateId = () => {
  return String(Math.floor(Math.random() * 2147483647));
};

const sanitizeAndLowerCase = (value?: string) => {
  if (!value) return '';

  return value.toLowerCase().replace(/[\s()/]/g, '');
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
      translations[component.title] = `${component.title} (${language})`;
    }
    if (component.label) {
      translations[component.label] = `${component.label} (${language})`;
    }
    if (component.fieldset) {
      translations[component.fieldset] = `${component.fieldset} (${language})`;
    }
    if (component.description) {
      translations[component.description] = `${component.description} (${language})`;
    }
    if (component.additionalDescriptionText) {
      translations[component.additionalDescriptionText] = `${component.additionalDescriptionText} (${language})`;
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
