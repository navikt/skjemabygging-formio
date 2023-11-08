import AccountNumber from './account-number/AccountNumber';
import AlertStripe from './alert-stripe/AlertStripe';
import Button from './button/Button';
import Container from './container/Container';
import CountrySelect from './country-select/CountrySelect';
import CurrencySelect from './currency-select/CurrencySelect';
import DataGrid from './datagrid/DataGrid';
import Day from './day/Day';
import Fodselsnummer from './fodselsnummer/Fodselsnummer';
import HTMLElement from './html-element/HTMLElement';
import IBAN from './iban/IBAN';
import Image from './image/Image';
import NavCheckbox from './nav-checkbox/NavCheckbox';
import NavDatepicker from './nav-datepicker/NavDatepicker';
import NavSelect from './nav-select/NavSelect';
import NavSkjemagruppe from './nav-skjema-gruppe/NavSkjemagruppe';
import Number from './number/Number';
import OrganizationNumber from './organization-number/OrganizationNumber';
import Radio from './radio/Radio';
import Row from './row/Row';
import SelectBoxes from './select-boxes/SelectBoxes';
import Textarea from './textarea/TextArea';
// import TextField from './textfield/deprecated/TextField.js';
import TextField from './textfield/NavTextField';

const customComponents = {
  container: Container,
  alertstripe: AlertStripe,
  fnrfield: Fodselsnummer,
  orgNr: OrganizationNumber,
  bankAccount: AccountNumber,
  htmlelement: HTMLElement,
  landvelger: CountrySelect,
  valutavelger: CurrencySelect,
  navDatepicker: NavDatepicker,
  navSelect: NavSelect,
  radiopanel: Radio,
  navCheckbox: NavCheckbox,
  datagrid: DataGrid,
  textfield: TextField,
  textArea: Textarea,
  number: Number,
  navSkjemagruppe: NavSkjemagruppe,
  selectboxes: SelectBoxes,
  day: Day,
  iban: IBAN,
  image: Image,
  row: Row,
  button: Button,
};
export default customComponents;
