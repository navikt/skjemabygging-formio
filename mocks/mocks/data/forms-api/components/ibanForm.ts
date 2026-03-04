import { iban, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const ibanForm = () => {
  const formNumber = 'iban';

  return form({
    title: 'IBAN component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          iban({
            label: 'IBAN',
          }),
          iban({
            label: 'IBAN med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          iban({
            label: 'IBAN påkrevd',
            validate: {
              required: true,
            },
          }),
          iban({
            label: 'IBAN ikke påkrevd',
            validate: {
              required: false,
            },
          }),
        ],
      }),
    ],
  });
};

const ibanTranslations = () => {
  return getMockTranslationsFromForm(ibanForm());
};

export { ibanForm, ibanTranslations };
