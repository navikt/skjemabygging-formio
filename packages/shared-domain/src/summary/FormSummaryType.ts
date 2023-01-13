export type SubmissionValue = string | number | boolean;
//TODO: add all types
export type ComponentType = "textfield" | "navCheckbox";

export interface FormSummaryComponent {
  label: string;
  key: string;
  type: ComponentType;
  value: SubmissionValue;
}

export interface FormSummaryPanel {
  label: string;
  key: string;
  type: "panel";
  components: FormSummaryComponent[];
}
