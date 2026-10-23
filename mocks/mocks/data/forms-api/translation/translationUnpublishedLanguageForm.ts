import { htmlElement, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';

const path = 'translationunpublishedlanguage';

const translationUnpublishedLanguageForm = () =>
  form({
    title: 'Skjema med upubliserte oversettelser',
    formNumber: 'TRANSLATION-UNPUBLISHED-LANGUAGE',
    path,
    status: 'published',
    publishedLanguages: ['nb', 'nn'],
    components: [
      panel({
        title: 'Veiledning',
        key: 'veiledning',
        components: [
          htmlElement({ key: 'veiledningstekst', content: 'Her skal det stå litt informasjon om søknaden' }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber: 'TRANSLATION-UNPUBLISHED-LANGUAGE',
      submissionTypes: ['PAPER'],
    }),
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

// English is translated but not published, so lang=en must not be used
const translationUnpublishedLanguageTranslations = () => ({
  _id: '123',
  data: {
    scope: 'local',
    form: path,
    language: 'en',
    i18n: {
      'Skjema med upubliserte oversettelser': 'Form with unpublished translations',
      Veiledning: 'Guidance',
      'Her skal det stå litt informasjon om søknaden': 'Info about the application',
    },
  },
});

export { translationUnpublishedLanguageForm, translationUnpublishedLanguageTranslations };
