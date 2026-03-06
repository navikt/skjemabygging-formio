import { navSelect, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const options = [
  { label: 'Alternativ 1', value: 'alt1' },
  { label: 'Alternativ 2', value: 'alt2' },
  { label: 'Alternativ 3', value: 'alt3' },
];

const selectForm = () => {
  const formNumber = 'select';

  return form({
    title: 'Select component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          navSelect({
            label: 'Velg alternativ',
            values: options,
          }),
          navSelect({
            label: 'Velg alternativ med beskrivelse',
            values: options,
            description: '<p>Dette er en beskrivelse</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          navSelect({
            label: 'Alternativ påkrevd',
            values: options,
          }),
          navSelect({
            label: 'Alternativ ikke påkrevd',
            values: options,
            validate: { required: false },
          }),
        ],
      }),
    ],
  });
};

const selectTranslations = () => getMockTranslationsFromForm(selectForm());

export { selectForm, selectTranslations };
