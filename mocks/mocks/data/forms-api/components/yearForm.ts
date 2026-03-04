import { panel, year } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const yearForm = () => {
  const formNumber = 'year';

  return form({
    title: 'Year component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          year({
            label: 'Årstall',
          }),
          year({
            label: 'Årstall med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          year({ label: 'Årstall påkrevd', validate: { required: true } }),
          year({ label: 'Årstall ikke påkrevd', validate: { required: false } }),
          year({ label: 'Årstall tidligst 2000', validate: { required: false, minYear: 2000 } }),
          year({ label: 'Årstall senest 2030', validate: { required: false, maxYear: 2030 } }),
          year({
            label: 'Årstall egendefinert',
            validate: { required: false, custom: 'valid = input == 2000 ? true : "Kun 2000 er tillatt"' },
          }),
        ],
      }),
    ],
  });
};

const yearTranslations = () => getMockTranslationsFromForm(yearForm());

export { yearForm, yearTranslations };
