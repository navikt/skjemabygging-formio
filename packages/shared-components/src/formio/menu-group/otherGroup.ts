import addressBuilder from '../components/core/address/Address.builder';
import drivingListBuilder from '../components/core/driving-list/DrivingList.builder';
import declarationCheckboxBuilder from '../components/extensions/declaration-checkbox/DeclarationCheckbox.builder';
import activitiesWithMaalgruppeBuilder from '../components/groups/activitiesWithMaalgruppe/activitiesWithMaalgruppe.builder';

const otherGroup = {
  title: 'Andre',
  components: {
    declarationCheckbox: declarationCheckboxBuilder(),
    activitiesWithMaalgruppe: activitiesWithMaalgruppeBuilder(),
    drivingList: drivingListBuilder(),
    address: addressBuilder(),
  },
};

export default otherGroup;
