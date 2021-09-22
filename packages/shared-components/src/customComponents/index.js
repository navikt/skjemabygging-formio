import Fodselsnummer from "./components/Fodselsnummer.jsx";
import HTMLElement from "./components/HTMLElement";
import NavDatepicker from "./components/NavDatepicker.jsx";
import RadioPanelGruppeComponent from "./components/RadioPanelGruppe";
import CheckboxComponent from "./components/Checkbox";
import DataGrid from "./components/DataGrid";
import TextField from "./components/TextField";
import Textarea from "./components/TextArea";
import Number from "./components/Number";
import NavSkjemagruppe from "./components/NavSkjemagruppe";
import SelectBoxes from "./components/SelectBoxes";
import AlertStripe from "./components/AlertStripe";
import Day from "./components/Day";

const customComponents = {
  alertstripe: AlertStripe,
  fnrfield: Fodselsnummer,
  htmlelement: HTMLElement,
  navDatepicker: NavDatepicker,
  radiopanel: RadioPanelGruppeComponent,
  navCheckbox: CheckboxComponent,
  datagrid: DataGrid,
  textfield: TextField,
  textArea: Textarea,
  number: Number,
  navSkjemagruppe: NavSkjemagruppe,
  selectboxes: SelectBoxes,
  day: Day,
};
export default customComponents;
