import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormValidation from '../../base/editForm/validation';
import editFormAddressPrefill from './editForm/editFormAddressPrefill';
import editFormAddressType from './editForm/editFormAddressType';

const addressForm = () => {
  const { conditional, createTabs, api, data, validation } = editFormTabs;

  // prettier-ignore
  return createTabs(
    data([
      editFormData.prefillKey({prefillKey: 'sokerAdresser'}),
      editFormAddressPrefill({customConditional: 'show = row.prefillKey === "sokerAdresser"'}),
      editFormAddressType({customConditional: 'show = row.prefillKey !== "sokerAdresser"'}),
    ]),
    validation([
      editFormValidation.required(),
    ]),
    api([
      editFormApi.key(),
    ]),
    conditional([
      editFormConditional.simpleConditional(),
      editFormConditional.advancedConditional(),
    ]),
  );
};

export default addressForm;
