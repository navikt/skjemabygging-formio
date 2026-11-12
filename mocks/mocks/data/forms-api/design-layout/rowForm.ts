import { currencySelect, number, panel, row, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const rowForm = () => {
  const formNumber = 'row';

  return form({
    title: 'Row component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          row({
            key: 'avstand',
            label: 'Avstand',
            hideLabel: false,
            isAmountWithCurrencySelector: false,
            components: [
              textField({ key: 'storrelse', label: 'Størrelse', fieldSize: 'input--s' }),
              textField({ key: 'retning', label: 'Retning', fieldSize: 'input--s' }),
            ],
          }),
          row({
            key: 'valutaOgBelop',
            label: 'Valuta og beløp',
            components: [
              currencySelect({ key: 'valuta', label: 'Velg valuta' }),
              number({ key: 'belop', label: 'Beløp', fieldSize: 'input--s' }),
            ],
          }),
        ],
      }),
    ],
  });
};

const rowTranslations = () => getMockTranslationsFromForm(rowForm());

export { rowForm, rowTranslations };
