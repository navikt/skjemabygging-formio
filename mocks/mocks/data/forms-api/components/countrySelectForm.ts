import { countrySelect, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const countrySelectForm = () => {
  const formNumber = 'countryselect';

  return form({
    title: 'CountrySelect component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          countrySelect({
            label: 'Velg land',
          }),
          countrySelect({
            label: 'Velg land med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
          }),
          countrySelect({
            label: 'Velg land uten Norge',
            ignoreNorway: true,
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          countrySelect({
            label: 'Land påkrevd',
          }),
          countrySelect({
            label: 'Land ikke påkrevd',
            validate: { required: false },
          }),
        ],
      }),
    ],
  });
};

const countrySelectTranslations = () => getMockTranslationsFromForm(countrySelectForm());

export { countrySelectForm, countrySelectTranslations };
