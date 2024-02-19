import FormioTextArea from 'formiojs/components/textarea/TextArea';
import Activities from './core/activities/Activities';
import Alert from './core/alert/Alert';
import Button from './core/button/Button';
import Checkbox from './core/checkbox/Checkbox';
import Container from './core/container/Container';
import DataGrid from './core/datagrid/DataGrid';
import DatePicker from './core/datepicker/DatePicker';
import Day from './core/day/Day';
import FormGroup from './core/form-group/FormGroup';
import HtmlElement from './core/html-element/HtmlElement';
import Image from './core/image/Image';
import Maalgruppe from './core/maalgruppe/Maalgruppe';
import Panel from './core/panel/Panel';
import Radio from './core/radio/Radio';
import Row from './core/row/Row';
import SelectBoxes from './core/select-boxes/SelectBoxes';
import NavSelect from './core/select/Select';
import TextArea from './core/textarea/TextArea';
import TextField from './core/textfield/TextField';
import AccountNumber from './extensions/account-number/AccountNumber';
import CountrySelect from './extensions/country-select/CountrySelect';
import CurrencySelect from './extensions/currency-select/CurrencySelect';
import Currency from './extensions/currency/Currency';
import Email from './extensions/email/Email';
import IBAN from './extensions/iban/IBAN';
import NationalIdentityNumber from './extensions/national-identity-number/NationalIdentityNumber';
import Number from './extensions/number/Number';
import OrganizationNumber from './extensions/organization-number/OrganizationNumber';
import PhoneNumber from './extensions/phone-number/PhoneNumber';

const customComponents = {
  container: Container,
  activities: Activities,
  maalgruppe: Maalgruppe,
  alertstripe: Alert,
  fnrfield: NationalIdentityNumber,
  orgNr: OrganizationNumber,
  bankAccount: AccountNumber,
  htmlelement: HtmlElement,
  landvelger: CountrySelect,
  valutavelger: CurrencySelect,
  navDatepicker: DatePicker,
  navSelect: NavSelect,
  radiopanel: Radio,
  navCheckbox: Checkbox,
  datagrid: DataGrid,
  textfield: TextField,
  textarea: TextArea,
  formioTextArea: FormioTextArea,
  number: Number,
  navSkjemagruppe: FormGroup,
  selectboxes: SelectBoxes,
  day: Day,
  iban: IBAN,
  image: Image,
  row: Row,
  button: Button,
  panel: Panel,
  email: Email,
  phoneNumber: PhoneNumber,
  currency: Currency,
};
export default customComponents;
