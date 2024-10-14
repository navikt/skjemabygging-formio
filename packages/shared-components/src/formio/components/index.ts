import FormioTextArea from 'formiojs/components/textarea/TextArea';
import Accordion from './core/accordion/Accordion';
import Activities from './core/activities/Activities';
import Address from './core/address/Address';
import Alert from './core/alert/Alert';
import DefaultAttachment from './core/attachment/default/DefaultAttachment';
import Checkbox from './core/checkbox/Checkbox';
import Container from './core/container/Container';
import DataGrid from './core/datagrid/DataGrid';
import DatePicker from './core/datepicker/DatePicker';
import Day from './core/day/Day';
import DrivingList from './core/driving-list/DrivingList';
import FormGroup from './core/form-group/FormGroup';
import HtmlElement from './core/html-element/HtmlElement';
import Image from './core/image/Image';
import Maalgruppe from './core/maalgruppe/Maalgruppe';
import MonthPicker from './core/monthpicker/MonthPicker';
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
import FirstName from './extensions/first-name/FirstName';
import IBAN from './extensions/iban/IBAN';
import Identity from './extensions/identity/Identity';
import NationalIdentityNumber from './extensions/national-identity-number/NationalIdentityNumber';
import Number from './extensions/number/Number';
import OrganizationNumber from './extensions/organization-number/OrganizationNumber';
import Password from './extensions/password/Password';
import PhoneNumber from './extensions/phone-number/PhoneNumber';
import Surname from './extensions/surname/Surname';
import Year from './extensions/year/Year';

const customComponents = {
  container: Container,
  activities: Activities,
  drivinglist: DrivingList,
  maalgruppe: Maalgruppe,
  alertstripe: Alert,
  fnrfield: NationalIdentityNumber,
  identity: Identity,
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
  panel: Panel,
  email: Email,
  phoneNumber: PhoneNumber,
  currency: Currency,
  attachment: DefaultAttachment,
  accordion: Accordion,
  navAddress: Address,
  monthPicker: MonthPicker,
  password: Password,
  year: Year,
  firstName: FirstName,
  surname: Surname,
};
export default customComponents;
