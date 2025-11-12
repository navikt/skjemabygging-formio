import builder from './builder';
import builderComponent from './builderComponent';
import builderEditForm from './builderEditForm';
import builderSidebar from './builderSidebar';
import builderWizard from './builderWizard';
import button from './button';
import checkbox from './checkbox';
import componentModal from './componentModal';
import container from './container';
import cssClasses from './cssClasses';
import datagrid from './datagrid';
import day from './day';
import dialog from './dialog';
import errorsList from './errorsList';
import field from './field';
import file from './file';
import html from './html';
import iconClass from './iconClass';
import input from './input';
import label from './label';
import message from './message';
import multipleMasksInput from './multipleMasksInput';
import navSkjemagruppe from './navSkjemagruppe';
import panel from './panel';
import radiopanel from './radiopanel';
import row from './row';
import select from './select';
import selectboxes from './selectboxes';
import tab from './tab';
import wizard from './wizard';
import wizardHeader from './wizardHeader';

export default {
  transform(type, text) {
    if (!text) {
      return text;
    }
    switch (type) {
      case 'class':
        // eslint-disable-next-line
        return this.cssClasses.hasOwnProperty(text.toString()) ? this.cssClasses[text.toString()] : text;
    }
    return text;
  },
  defaultIconset: 'fa',
  iconClass,
  cssClasses,
  builder,
  builderComponent,
  builderEditForm,
  builderWizard,
  builderSidebar,
  button,
  checkbox,
  componentModal,
  container,
  datagrid,
  day,
  dialog,
  errorsList,
  field,
  file,
  html,
  input,
  label,
  message,
  multipleMasksInput,
  'fieldset-navSkjemagruppe': navSkjemagruppe,
  panel,
  radio: radiopanel,
  'radio-selectboxes': selectboxes,
  row,
  select,
  tab,
  wizard,
  wizardHeader,
};
