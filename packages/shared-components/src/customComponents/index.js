import AlertStripe from "./components/AlertStripe";
import Container from "./components/Container";
import CountrySelect from "./components/CountrySelect";
import CurrencySelect from "./components/CurrencySelect";
import DataGrid from "./components/DataGrid";
import Day from "./components/Day";
import Fodselsnummer from "./components/Fodselsnummer.jsx";
import HTMLElement from "./components/HTMLElement";
import IBAN from "./components/IBAN";
import Image from "./components/Image";
import NavCheckbox from "./components/NavCheckbox";
import NavDatepicker from "./components/NavDatepicker.jsx";
import NavSkjemagruppe from "./components/NavSkjemagruppe";
import Number from "./components/Number";
import OrganizationNumber from "./components/OrganizationNumber";
import Radio from "./components/Radio";
import Row from "./components/Row";
import SelectBoxes from "./components/SelectBoxes";
import Textarea from "./components/TextArea";
import TextField from "./components/TextField";

const customComponents = {
  container: Container,
  alertstripe: AlertStripe,
  fnrfield: Fodselsnummer,
  orgNr: OrganizationNumber,
  htmlelement: HTMLElement,
  landvelger: CountrySelect,
  valutavelger: CurrencySelect,
  navDatepicker: NavDatepicker,
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
};
export default customComponents;
