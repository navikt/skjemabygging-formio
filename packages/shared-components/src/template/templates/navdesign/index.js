import alert from "./alert";
import alertstripe from "./alertstripe";
import builderComponent from "./builderComponent";
import builderEditForm from "./builderEditForm";
import builderSidebar from "./builderSidebar";
import builderWizard from "./builderWizard";
import button from "./button";
import checkbox from "./checkbox";
import componentModal from "./componentModal";
import components from "./components";
import container from "./container";
import cssClasses from "./cssClasses";
import datagrid from "./datagrid";
import day from "./day";
import dialog from "./dialog";
import errorsList from "./errorsList";
import field from "./field";
import file from "./file";
import html from "./html";
import iconClass from "./iconClass";
import image from "./image";
import input from "./input";
import label from "./label";
import message from "./message";
import multipleMasksInput from "./multipleMasksInput";
import navSkjemagruppe from "./navSkjemagruppe";
import panel from "./panel";
import radiopanel from "./radiopanel";
import row from "./row";
import select from "./select";
import selectboxes from "./selectboxes";
import signature from "./signature";
import tab from "./tab";
import table from "./table";
import wizard from "./wizard";
import wizardHeader from "./wizardHeader";
import wizardNav from "./wizardNav";

export default {
  transform(type, text) {
    if (!text) {
      return text;
    }
    switch (type) {
      case "class":
        return this.cssClasses.hasOwnProperty(text.toString()) ? this.cssClasses[text.toString()] : text;
    }
    return text;
  },
  defaultIconset: "fa",
  iconClass,
  cssClasses,
  alert,
  "html-alertstripe": alertstripe,
  builderComponent,
  builderEditForm,
  builderSidebar,
  builderWizard,
  button,
  checkbox,
  componentModal,
  components,
  container,
  datagrid,
  day,
  dialog,
  errorsList,
  field,
  file,
  html,
  input,
  image,
  label,
  message,
  multipleMasksInput,
  "fieldset-navSkjemagruppe": navSkjemagruppe,
  panel,
  radio: radiopanel,
  "radio-selectboxes": selectboxes,
  row,
  select,
  signature,
  tab,
  table,
  wizard,
  wizardHeader,
  wizardNav,
};
