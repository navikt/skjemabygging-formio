import { currency, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const currencyForm = () => {
  const formNumber = 'currency';

  return form({
    title: 'Currency component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          currency({
            label: 'Beløp',
          }),
          currency({
            label: 'Beløp med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
          currency({
            label: 'Heltall',
            inputType: 'numeric',
          }),
        ],
      }),
      panel({
        title: 'Data',
        components: [
          currency({
            label: 'Beløp A',
            key: 'belopA',
          }),
          currency({
            label: 'Beløp B',
            key: 'belopB',
          }),
          {
            ...currency({ label: 'Kalkulert sum', key: 'kalkulertSum' }),
            calculateValue: "value = (data.belopA + data.belopB) || ''",
            readOnly: true,
          },
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          currency({
            label: 'Beløp påkrevd',
          }),
          currency({
            label: 'Beløp ikke påkrevd',
            validate: { required: false },
          }),
          currency({
            label: 'Beløp egendefinert',
            validate: {
              required: false,
              custom: 'valid = input == 100 ? true : "Kun 100 er tillatt"',
            },
          }),
        ],
      }),
    ],
  });
};

const currencyTranslations = () => getMockTranslationsFromForm(currencyForm());

export { currencyForm, currencyTranslations };
