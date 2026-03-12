import { accountNumber, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const bankAccountForm = () => {
  const formNumber = 'bankaccount';

  return form({
    title: 'BankAccount component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          accountNumber({
            label: 'Kontonummer',
          }),
          accountNumber({
            label: 'Kontonummer med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          accountNumber({
            label: 'Kontonummer påkrevd',
            validate: {
              required: true,
              custom: 'valid = instance.validateAccountNumber(input)',
            },
          }),
          accountNumber({
            label: 'Kontonummer ikke påkrevd',
            validate: {
              required: false,
              custom: 'valid = instance.validateAccountNumber(input)',
            },
          }),
        ],
      }),
    ],
  });
};

const bankAccountTranslations = () => {
  return getMockTranslationsFromForm(bankAccountForm());
};

export { bankAccountForm, bankAccountTranslations };
