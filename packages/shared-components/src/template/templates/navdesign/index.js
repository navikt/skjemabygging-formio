import address from "./address";
import alertstripe from "./alertstripe";
import builder from "./builder";
import builderComponent from "./builderComponent";
import builderComponents from "./builderComponents";
import builderEditForm from "./builderEditForm";
import builderPlaceholder from "./builderPlaceholder";
import builderSidebar from "./builderSidebar";
import builderSidebarGroup from "./builderSidebarGroup";
import builderWizard from "./builderWizard";
import button from "./button";
import checkbox from "./checkbox";
import columns from "./columns";
import component from "./component";
import componentModal from "./componentModal";
import components from "./components";
import container from "./container";
import cssClasses from "./cssClasses";
import datagrid from "./datagrid";
import day from "./day";
import dialog from "./dialog";
import editgrid from "./editgrid";
import errorsList from "./errorsList";
import field from "./field";
import fieldset from "./fieldset";
import file from "./file";
import html from "./html";
import icon from "./icon";
import iconClass from "./iconClass";
import image from "./image";
import input from "./input";
import label from "./label";
import loader from "./loader";
import loading from "./loading";
import map from "./map";
import message from "./message";
import multipleMasksInput from "./multipleMasksInput";
import multiValueRow from "./multiValueRow";
import multiValueTable from "./multiValueTable";
import navSkjemagruppe from "./navSkjemagruppe";
import panel from "./panel";
import pdf from "./pdf";
import pdfBuilder from "./pdfBuilder";
import pdfBuilderUpload from "./pdfBuilderUpload";
import radiopanel from "./radiopanel";
import resourceAdd from "./resourceAdd";
import row from "./row";
import select from "./select";
import selectboxes from "./selectboxes";
import selectOption from "./selectOption";
import signature from "./signature";
import survey from "./survey";
import tab from "./tab";
import table from "./table";
import tree from "./tree";
import treePartials from "./tree/partials";
import webform from "./webform";
import well from "./well";
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
  address,
  "html-alertstripe": alertstripe,
  builder,
  builderComponent,
  builderComponents,
  builderEditForm,
  builderPlaceholder,
  builderSidebar,
  builderSidebarGroup,
  builderWizard,
  button,
  checkbox,
  columns,
  component,
  componentModal,
  components,
  container,
  datagrid,
  day,
  dialog,
  editgrid,
  errorsList,
  field,
  fieldset,
  file,
  html,
  icon,
  input,
  image,
  label,
  loader,
  loading,
  map,
  message,
  multipleMasksInput,
  multiValueRow,
  multiValueTable,
  "fieldset-navSkjemagruppe": navSkjemagruppe,
  panel,
  pdf,
  pdfBuilder,
  pdfBuilderUpload,
  radio: radiopanel,
  "radio-selectboxes": selectboxes,
  resourceAdd,
  row,
  select,
  selectOption,
  signature,
  survey,
  tab,
  table,
  tree,
  ...treePartials,
  webform,
  well,
  wizard,
  wizardHeader,
  wizardNav,
};
