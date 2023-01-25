export type SubmissionValue = string | number;

export type ContainerType = "fieldset" | "navSkjemagruppe";
export type FieldType =
  | "textfield"
  | "textarea"
  | "number"
  | "navCheckbox"
  | "radiopanel"
  | "navSelect"
  | "select"
  | "email"
  | "phoneNumber"
  | "navDatepicker"
  | "day"
  | "landvelger"
  | "currency"
  | "valutavelger"
  | "alertstripe";

export type ComponentType = ContainerType | FieldType;

export interface FormSummaryField {
  label: string;
  key: string;
  type: FieldType;
  value: SubmissionValue;
}

export interface FormSummarySelectboxes extends Omit<FormSummaryField, "type" | "value"> {
  type: "selectboxes";
  value: string[];
}

export interface FormSummaryImage extends Omit<FormSummaryField, "type"> {
  type: "image";
  value: string;
  alt: string;
  widthPercent: number;
}

export interface FormSummaryContainer {
  label: string;
  key: string;
  type: ContainerType;
  components: FormSummaryComponent[];
}

export interface FormSummaryPanel extends Omit<FormSummaryContainer, "type"> {
  type: "panel";
}

export interface FormSummaryDataGridRow extends Omit<FormSummaryContainer, "type"> {
  type: "datagrid-row";
}

export interface FormSummaryDataGrid extends Omit<FormSummaryContainer, "type" | "components"> {
  type: "datagrid";
  components: FormSummaryDataGridRow[];
}

export type FormSummaryComponent =
  | FormSummaryField
  | FormSummaryContainer
  | FormSummaryPanel
  | FormSummaryDataGrid
  | FormSummarySelectboxes
  | FormSummaryImage;
