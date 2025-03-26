import drivingListBuilder from '../components/core/driving-list/DrivingList.builder';
import komponentenBuilder from '../components/core/komponenten/Komponenten.builder';
import declarationCheckboxBuilder from '../components/extensions/declaration-checkbox/DeclarationCheckbox.builder';
import activitiesWithMaalgruppeBuilder from '../components/groups/activitiesWithMaalgruppe/activitiesWithMaalgruppe.builder';

const otherGroup = {
  title: 'Andre',
  components: {
    declarationCheckbox: declarationCheckboxBuilder(),
    activitiesWithMaalgruppe: activitiesWithMaalgruppeBuilder(),
    drivingList: drivingListBuilder(),
    komponenten: komponentenBuilder(),
  },
};

export default otherGroup;
