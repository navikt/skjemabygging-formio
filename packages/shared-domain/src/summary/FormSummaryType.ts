export type SubmissionValue = string | number | boolean | string[];
//TODO: add all types

export type ContainerType = "fieldset" | "panel" | "navSkjemagruppe" | "datagrid" | "datagrid-row";
export type FieldType = "textfield" | "image" | "selectboxes";

export type ComponentType = ContainerType | FieldType;

export interface FormSummaryField {
  label: string;
  key: string;
  type: FieldType;
  value: SubmissionValue;
}

export interface FormSummarySelectboxes extends FormSummaryField {
  type: "selectboxes";
  value: string[];
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

export interface FormSummaryPanel extends FormSummaryContainer {
  type: "panel";
}

export type FormSummaryComponent = FormSummaryField | FormSummaryContainer;
