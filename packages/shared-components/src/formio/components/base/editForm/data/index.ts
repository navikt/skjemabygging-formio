import editFormCalculateValue from './editFormCalculateValue';
import editFormClearOnHide from './editFormClearOnHide';
import editFormDataValues from './editFormDataValues';
import editFormDefaultValue from './editFormDefaultValue';
import editFormPrefill from './editFormPrefill';
import editFormReadOnly from './editFormReadOnly';
import editFormValues from './editFormValues';

const editFormData = {
  defaultValue: editFormDefaultValue,
  clearOnHide: editFormClearOnHide,
  dataValues: editFormDataValues,
  calculateValue: editFormCalculateValue,
  readOnly: editFormReadOnly,
  values: editFormValues,
  prefill: editFormPrefill,
};

export default editFormData;
