import { accountNumber, currencySelect, iban, number, panel, row } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const currencyAndAccountForm = () =>
  form({
    title: 'Cypress penger og konto',
    formNumber: 'pengerogkonto',
    path: 'pengerogkonto',
    components: [
      panel({
        key: 'penger',
        title: 'Penger og konto',
        components: [
          accountNumber({
            key: 'kontoNummer',
            label: 'Kontonummer',
            validate: {
              custom: 'valid = instance.validateAccountNumber(input)',
            },
          }),
          iban({
            key: 'iban',
            label: 'IBAN',
            validate: {
              custom: 'valid = instance.validateIban(input);',
            },
          }),
          row({
            key: 'angiValutaOgBelop',
            label: 'Angi valuta og beløp',
            components: [
              currencySelect({
                key: 'valutavelger',
                label: 'Velg valuta',
              }),
              number({
                key: 'belop1',
                label: 'Beløp',
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'pengerogkonto', submissionTypes: ['PAPER'] }),
  });

const currencyAndAccountTranslations = () => getMockTranslationsFromForm(currencyAndAccountForm());

export { currencyAndAccountForm, currencyAndAccountTranslations };
