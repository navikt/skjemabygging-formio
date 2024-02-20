import { AttachmentValue } from '../attachment';

export namespace Summary {
  export type SubmissionValue = string | number;

  export type FieldsetType = 'fieldset' | 'navSkjemagruppe';
  export type FieldType =
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

  export interface Field {
    label: string;
    key: string;
    type: FieldType;
    value: SubmissionValue;
  }

  export interface Selectboxes extends Omit<Field, 'type' | 'value'> {
    type: 'selectboxes';
    value: string[];
  }

  export interface Activity extends Omit<Field, 'type' | 'value'> {
    type: 'activities';
    value: {
      aktivitetId: string;
      maalgruppe: string;
      periode: { fom: string; tom: string };
      text: string;
    };
  }

  export interface Image extends Omit<Field, 'type'> {
    type: 'image';
    value: string;
    alt: string;
    widthPercent: number;
  }

  export interface Fieldset {
    label: string;
    key: string;
    type: FieldsetType;
    components: Component[];
  }

  export interface Attachment extends Omit<Field, 'type' | 'value'> {
    type: 'attachment';
    value: AttachmentValue;
  }

  export interface Panel extends Omit<Fieldset, 'type'> {
    type: 'panel';
  }

  export interface DataGridRow extends Omit<Fieldset, 'type'> {
    type: 'datagrid-row';
  }

  export interface DataGrid extends Omit<Fieldset, 'type' | 'components'> {
    type: 'datagrid';
    components: DataGridRow[];
  }

  export type Component =
    | Field
    | Fieldset
    | Panel
    | DataGrid
    | DataGridRow
    | Selectboxes
    | Image
    | Attachment
    | Activity;
}
