import { AttachmentValue } from '../attachment';
import { SubmissionActivity } from '../submission/activity';

export type SummarySubmissionValue = string | number;

export type SummaryFieldsetType = 'fieldset' | 'navSkjemagruppe';
export type SummaryFieldType =
  | 'textfield'
  | 'textarea'
  | 'number'
  | 'navCheckbox'
  | 'radiopanel'
  | 'navSelect'
  | 'select'
  | 'email'
  | 'htmlelement'
  | 'phoneNumber'
  | 'navDatepicker'
  | 'day'
  | 'landvelger'
  | 'currency'
  | 'valutavelger'
  | 'alertstripe'
  | 'attachment';

export interface SummaryField {
  label: string;
  key: string;
  type: SummaryFieldType;
  value: SummarySubmissionValue;
}

export interface SummarySelectboxes extends Omit<SummaryField, 'type' | 'value'> {
  type: 'selectboxes';
  value: string[];
}

export interface SummaryAddress extends Omit<SummaryField, 'type'> {
  type: 'navAddress';
}

export interface SummaryActivity extends Omit<SummaryField, 'type' | 'value'> {
  type: 'activities';
  value: SubmissionActivity;
}

export interface SummaryDrivingList extends Omit<SummaryField, 'type' | 'value'> {
  type: 'drivinglist';
  value: { description: string; dates: { text: string; key: string }[] };
}

export interface SummaryFieldset {
  label: string;
  key: string;
  type: SummaryFieldsetType;
  components: SummaryComponent[];
}

export interface SummaryAttachment extends Omit<SummaryField, 'type' | 'value'> {
  type: 'attachment';
  value: AttachmentValue;
}

export interface SummaryPanel extends Omit<SummaryFieldset, 'type'> {
  type: 'panel';
}

export interface SummaryDataGridRow extends Omit<SummaryFieldset, 'type'> {
  type: 'datagrid-row';
}

export interface SummaryDataGrid extends Omit<SummaryFieldset, 'type' | 'components'> {
  type: 'datagrid';
  components: SummaryDataGridRow[];
}

export type SummaryComponent = (
  | SummaryField
  | SummaryFieldset
  | SummaryPanel
  | SummaryDataGrid
  | SummaryDataGridRow
  | SummarySelectboxes
  | SummaryActivity
  | SummaryAttachment
  | SummaryDrivingList
  | SummaryAddress
) & {
  hiddenInSummary?: boolean;
};
