import { activites, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const activitiesTestForm = () => {
  const formNumber = 'aktiviteter';

  return form({
    title: 'Activities component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          activites({ key: 'aktivitet1' }),
          activites({
            key: 'aktivitet2',
            label: 'Aktivitet med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
    ],
  });
};

const activitiesTranslations = () => getMockTranslationsFromForm(activitiesTestForm());

export { activitiesTestForm, activitiesTranslations };
