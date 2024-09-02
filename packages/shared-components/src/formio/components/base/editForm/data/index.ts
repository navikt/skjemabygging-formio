import editFormAccordionGrid from './editFormAccordionGrid';
import editFormAttachment from './editFormAttachment';
import editFormCalculateValue from './editFormCalculateValue';
import editFormClearOnHide from './editFormClearOnHide';
import editFormDataValues from './editFormDataValues';
import editFormDefaultValue from './editFormDefaultValue';
import editFormPrefill from './editFormPrefill';
import editFormPrefillKey from './editFormPrefillKey';
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
  prefillKey: editFormPrefillKey,
  attachment: editFormAttachment,
  accordionGrid: editFormAccordionGrid,
};

export default editFormData;
