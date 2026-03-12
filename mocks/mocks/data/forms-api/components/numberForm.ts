import { number, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const numberForm = () => {
  const formNumber = 'number';

  return form({
    title: 'Number component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          number({
            label: 'Tall',
          }),
          number({
            label: 'Tall med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
          number({
            label: 'Desimaltall',
            inputType: 'decimal',
          }),
        ],
      }),
      panel({
        title: 'Data',
        components: [
          number({
            label: 'Tall A',
            key: 'tallA',
          }),
          number({
            label: 'Tall B',
            key: 'tallB',
          }),
          number({
            label: 'Kalkulert sum',
            key: 'kalkulertSum',
            calculateValue: "value = (data.tallA + data.tallB) || ''",
            readOnly: true,
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          number({
            label: 'Tall påkrevd',
          }),
          number({
            label: 'Tall ikke påkrevd',
            validate: { required: false },
          }),
          number({
            label: 'Tall min og max',
            validate: { required: false, min: 0, max: 100 },
          }),
          number({
            label: 'Tall egendefinert',
            validate: {
              required: false,
              custom: 'valid = input == 5 ? true : "Kun 5 er tillatt"',
            },
          }),
        ],
      }),
    ],
  });
};

const numberTranslations = () => getMockTranslationsFromForm(numberForm());

export { numberForm, numberTranslations };
