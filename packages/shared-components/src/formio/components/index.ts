import Alert from './core/alert/Alert';
import Button from './core/button/Button';
import Checkbox from './core/checkbox/Checkbox';
import Container from './core/container/Container';
import DataGrid from './core/datagrid/DataGrid';
import Datepicker from './core/datepicker/Datepicker';
import Day from './core/day/Day';
import FormGroup from './core/form-group/FormGroup';
import HTMLElement from './core/html-element/HTMLElement';
import Image from './core/image/Image';
import Radio from './core/radio/Radio';
import Row from './core/row/Row';
import SelectBoxes from './core/select-boxes/SelectBoxes';
import Textarea from './core/textarea/TextArea';
import TextField from './core/textfield/TextField';
import CountrySelect from './country-select/CountrySelect';
import CurrencySelect from './currency-select/CurrencySelect';
import AccountNumber from './extensions/account-number/AccountNumber';
import IBAN from './extensions/iban/IBAN';
import NationalIdentityNumber from './extensions/national-identity-number/NationalIdentityNumber';
import Number from './extensions/number/Number';
import OrganizationNumber from './extensions/organization-number/OrganizationNumber';
import NavSelect from './nav-select/NavSelect';

const customComponents = {
  container: Container,
  alertstripe: Alert,
  fnrfield: NationalIdentityNumber,
  orgNr: OrganizationNumber,
  bankAccount: AccountNumber,
  htmlelement: HTMLElement,
  landvelger: CountrySelect,
  valutavelger: CurrencySelect,
  navDatepicker: Datepicker,
  navSelect: NavSelect,
  radiopanel: Radio,
  navCheckbox: Checkbox,
  datagrid: DataGrid,
  textfield: TextField,
  textArea: Textarea,
  number: Number,
  navSkjemagruppe: FormGroup,
  selectboxes: SelectBoxes,
  day: Day,
  iban: IBAN,
  image: Image,
  row: Row,
  button: Button,
};
export default customComponents;
