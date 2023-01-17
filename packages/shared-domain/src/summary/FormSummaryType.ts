export type SubmissionValue = string | number | boolean;
//TODO: add all types

export type ContainerType = "fieldset" | "panel" | "container" | "navSkjemagruppe" | "datagrid";
export type FieldType = "textfield" | "datagrid-row" | "selectboxes" | "image";

export type ComponentType = ContainerType | FieldType;

export interface FormSummaryField {
  label: string;
  key: string;
  type: FieldType;
  value: SubmissionValue;
}

export interface FormSummaryImage extends FormSummaryField {
  type: "image";
  alt: string;
  widthPercent: number;
}

export interface FormSummaryContainer {
  label: string;
  key: string;
  type: ContainerType;
  components: FormSummaryComponent[];
}

export type FormSummaryComponent = FormSummaryField | FormSummaryContainer;

export interface FormSummaryPanel {
  label: string;
  key: string;
  type: "panel";
  components: FormSummaryComponent[];
}
