import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';

const path = 'translationsavedlanguage';

const translationSavedLanguageForm = () =>
  form({
    title: 'Skjema for gjenopptak',
    formNumber: 'TRANSLATION-SAVED-LANGUAGE',
    path,
    status: 'published',
    publishedLanguages: ['nb', 'nn'],
    components: [
      panel({
        title: 'Forklaring',
        key: 'details',
        components: [textField({ key: 'explanation', label: 'Din forklaring' })],
      }),
    ],
    properties: formProperties({
      formNumber: 'TRANSLATION-SAVED-LANGUAGE',
      submissionTypes: ['DIGITAL'],
    }),
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

const translationSavedLanguageTranslations = () => ({
  _id: '123',
  data: {
    scope: 'local',
    form: path,
    language: 'en',
    i18n: {
      'Skjema for gjenopptak': 'Form for resuming an application',
      Forklaring: 'Explanation',
      'Din forklaring': 'Your explanation',
    },
  },
});

export { translationSavedLanguageForm, translationSavedLanguageTranslations };
