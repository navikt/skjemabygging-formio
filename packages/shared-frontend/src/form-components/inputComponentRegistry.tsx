import InputAccountNumber from './components/account-number/InputAccountNumber';
import InputAddressValidity from './components/address-validity/InputAddressValidity';
import InputAddress from './components/address/InputAddress';
import InputAlert from './components/alert/InputAlert';
import InputCheckbox from './components/checkbox/InputCheckbox';
import InputContainer from './components/container/InputContainer';
import InputCountrySelect from './components/country-select/InputCountrySelect';
import InputCurrencySelect from './components/currency-select/InputCurrencySelect';
import InputCurrency from './components/currency/InputCurrency';
import InputDataGrid from './components/data-grid/InputDataGrid';
import InputDatePicker from './components/date-picker/InputDatePicker';
import InputEmail from './components/email/InputEmail';
import InputFirstName from './components/first-name/InputFirstName';
import InputFormGroup from './components/form-group/InputFormGroup';
import InputHtmlElement from './components/html-element/InputHtmlElement';
import InputIban from './components/iban/InputIban';
import InputIdentity from './components/identity/InputIdentity';
import InputMonthPicker from './components/month-picker/InputMonthPicker';
import InputNationalIdentityNumber from './components/national-identity-number/InputNationalIdentityNumber';
import InputNumber from './components/number/InputNumber';
import InputOrganizationNumber from './components/organization-number/InputOrganizationNumber';
import InputPhoneNumber from './components/phone-number/InputPhoneNumber';
import InputRadio from './components/radio/InputRadio';
import InputRow from './components/row/InputRow';
import InputSelectBoxes from './components/select-boxes/InputSelectBoxes';
import InputNavSelect from './components/select/InputNavSelect';
import InputSelect from './components/select/InputSelect';
import InputSurname from './components/surname/InputSurname';
import InputTextArea from './components/text-area/InputTextArea';
import InputTextField from './components/text-field/InputTextField';
import InputYear from './components/year/InputYear';
import { InputComponentProps, InputComponentRegistry } from './inputComponentRegistryUtils';

const inputComponentRegistry: InputComponentRegistry = {
  alertstripe: InputAlert,
  navAddress: InputAddress,
  addressValidity: InputAddressValidity,
  bankAccount: InputAccountNumber,
  container: InputContainer,
  datagrid: InputDataGrid,
  htmlelement: InputHtmlElement,
  iban: InputIban,
  navSkjemagruppe: InputFormGroup,
  fieldset: InputFormGroup,
  row: InputRow,
  number: InputNumber,
  phoneNumber: InputPhoneNumber,
  textfield: InputTextField,
  textarea: InputTextArea,
  formioTextArea: InputTextArea,
  select: InputSelect,
  navSelect: InputNavSelect,
  landvelger: InputCountrySelect,
  valutavelger: InputCurrencySelect,
  radiopanel: InputRadio,
  navCheckbox: InputCheckbox,
  selectboxes: InputSelectBoxes,
  email: InputEmail,
  firstName: InputFirstName,
  surname: InputSurname,
  currency: InputCurrency,
  year: InputYear,
  navDatepicker: InputDatePicker,
  monthPicker: InputMonthPicker,
  orgNr: InputOrganizationNumber,
  fnrfield: InputNationalIdentityNumber,
  identity: InputIdentity,
};

export { inputComponentRegistry };
export type { InputComponentProps, InputComponentRegistry };
