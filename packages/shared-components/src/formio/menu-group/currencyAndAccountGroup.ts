import accountNumberBuilder from '../components/extensions/account-number/AccountNumber.builder';
import currencySelectBuilder from '../components/extensions/currency-select/CurrencySelect.builder';
import currencyBuilder from '../components/extensions/currency/Currency.builder';
import IBANBuilder from '../components/extensions/iban/IBAN.builder';
import amountWithCurrencyBuilder from '../components/groups/amountWithCurrency/AmountWithCurrency.builder';

const currencyAndAccountGroup = {
  title: 'Penger og konto',
  components: {
    currency: currencyBuilder(),
    amountWithCurrencySelector: amountWithCurrencyBuilder(),
    bankAccount: accountNumberBuilder(),
    iban: IBANBuilder(),
    valutavelger: currencySelectBuilder(),
  },
};

export default currencyAndAccountGroup;
