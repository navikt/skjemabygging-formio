import { drivingList, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const drivingListTestForm = () => {
  const formNumber = 'drivinglist';

  return form({
    title: 'DrivingList component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Standard',
        components: [drivingList({ key: 'kjoreliste1' })],
      }),
      panel({
        title: 'Beskrivelse',
        components: [
          drivingList({
            key: 'kjoreliste2',
            label: 'Kjøreliste med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
    ],
  });
};

const drivingListTranslations = () => getMockTranslationsFromForm(drivingListTestForm());

export { drivingListTestForm, drivingListTranslations };
