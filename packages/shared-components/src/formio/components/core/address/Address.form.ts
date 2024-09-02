import editFormApi from '../../base/editForm/api';
import editFormConditional from '../../base/editForm/conditional';
import editFormData from '../../base/editForm/data';
import editFormTabs from '../../base/editForm/editFormTabs';
import editFormAddressPriority from './editForm/editFormAddressPriority';
import editFormAddressType from './editForm/editFormAddressType';
import editFormAddressUserSelect from './editForm/editFormAddressUserSelect';

const addressForm = () => {
  const { conditional, createTabs, api, data } = editFormTabs;

  // prettier-ignore
  return createTabs(
    data([
      editFormData.prefillKey({prefillKey: 'sokerAdresser'}),
      editFormData.readOnly({
        hidden: true,
        clearOnHide: false,
        calculateValue: 'value = row.prefillKey === "sokerAdresser"',
      }),
      editFormAddressPriority({customConditional: 'show = row.prefillKey === "sokerAdresser"'}),
      editFormAddressUserSelect({customConditional: 'show = row.prefillKey !== "sokerAdresser"'}),
      editFormAddressType({customConditional: 'show = row.prefillKey !== "sokerAdresser" && !row.addressUserSelect'}),
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
