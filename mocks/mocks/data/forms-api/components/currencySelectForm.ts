import { currencySelect, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const currencySelectForm = () => {
  const formNumber = 'currencyselect';

  return form({
    title: 'CurrencySelect component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          currencySelect({
            label: 'Velg valuta',
          }),
          currencySelect({
            label: 'Velg valuta med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          currencySelect({
            label: 'Valuta påkrevd',
          }),
          currencySelect({
            label: 'Valuta ikke påkrevd',
            validate: { required: false },
          }),
        ],
      }),
    ],
  });
};

const currencySelectTranslations = () => getMockTranslationsFromForm(currencySelectForm());

export { currencySelectForm, currencySelectTranslations };
