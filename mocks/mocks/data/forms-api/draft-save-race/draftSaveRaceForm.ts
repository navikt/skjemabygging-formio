import { checkbox, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const draftSaveRaceForm = () =>
  form({
    title: 'Draft save race',
    formNumber: 'draftsaverace',
    path: 'draftsaverace',
    components: [
      panel({
        key: 'answers',
        title: 'Answers',
        components: [
          textField({ key: 'answer', label: 'Answer', validate: { required: true } }),
          checkbox({ key: 'extraPage', label: 'Show extra page', validate: { required: false } }),
        ],
      }),
      panel({
        key: 'extra',
        title: 'Extra page',
        conditional: { when: 'extraPage', eq: 'true', show: true },
        components: [textField({ key: 'extraAnswer', label: 'Extra answer' })],
      }),
      panel({
        key: 'next',
        title: 'Next page',
        components: [textField({ key: 'otherAnswer', label: 'Other answer' })],
      }),
    ],
  });

const draftSaveRaceTranslations = () => getMockTranslationsFromForm(draftSaveRaceForm());

export { draftSaveRaceForm, draftSaveRaceTranslations };
