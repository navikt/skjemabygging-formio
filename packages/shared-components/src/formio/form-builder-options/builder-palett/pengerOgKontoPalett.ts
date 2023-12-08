import currencySelectBuilder from '../../components/extensions/currency-select/CurrencySelect.builder';
import ibanSchema from '../schemas/ibanSchema';

const currency = {
  title: 'Beløp',
  key: 'belop',
  icon: 'dollar',
  schema: {
    label: 'Beløp',
    type: 'currency',
    key: 'belop',
    fieldSize: 'input--s',
    input: true,
    currency: 'nok',
    spellcheck: false,
    dataGridLabel: true,
    clearOnHide: true,
    validateOn: 'blur',
    validate: {
      required: true,
    },
  },
};

const pengerOgKontoPalett = {
  title: 'Penger og konto',
  components: {
    currency,
    amountWithCurrencySelector: {
      title: 'Beløp med valuta',
      key: 'belopMedValuta',
      icon: 'dollar',
      schema: {
        label: 'Angi valuta og beløp',
        components: [currencySelectBuilder(), { ...currency.schema, type: 'number' }],
        type: 'row',
        isAmountWithCurrencySelector: true,
      },
    },
    bankAccount: {
      title: 'Kontonummer',
      key: 'kontonummer',
      icon: 'bank',
      schema: {
        label: 'Kontonummer',
        type: 'bankAccount',
        key: 'kontoNummer',
        fieldSize: 'input--s',
        input: true,
        dataGridLabel: true,
        spellcheck: false,
        validateOn: 'blur',
        clearOnHide: true,
        displayMask: '9999 99 99999',
        inputMaskPlaceholderChar: ' ', // U+00a0 -space
        validate: {
          required: true,
          custom: 'valid = instance.validateAccountNumber(input)',
          customMessage: 'Dette er ikke et gyldig kontonummer',
        },
      },
    },
    iban: {
      title: 'IBAN',
      key: 'iban',
      icon: 'bank',
      schema: ibanSchema(),
    },
    valutavelger: currencySelectBuilder(),
  },
};

export default pengerOgKontoPalett;
