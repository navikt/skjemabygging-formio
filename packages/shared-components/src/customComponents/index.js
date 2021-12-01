import AlertStripe from "./components/AlertStripe";
import CountrySelect from "./components/CountrySelect";
import DataGrid from "./components/DataGrid";
import Day from "./components/Day";
import Fodselsnummer from "./components/Fodselsnummer.jsx";
import HTMLElement from "./components/HTMLElement";
import IBAN from "./components/IBAN";
import NavCheckbox from "./components/NavCheckbox";
import NavDatepicker from "./components/NavDatepicker.jsx";
import NavSkjemagruppe from "./components/NavSkjemagruppe";
import Number from "./components/Number";
import Radio from "./components/Radio";
import SelectBoxes from "./components/SelectBoxes";
import Textarea from "./components/TextArea";
import TextField from "./components/TextField";

const customComponents = {
  alertstripe: AlertStripe,
  fnrfield: Fodselsnummer,
  htmlelement: HTMLElement,
  landvelger: CountrySelect,
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
};
export default customComponents;
