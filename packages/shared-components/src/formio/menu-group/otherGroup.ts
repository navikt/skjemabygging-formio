import drivingListBuilder from '../components/core/driving-list/DrivingList.builder';
import activitiesWithMaalgruppeBuilder from '../components/groups/activitiesWithMaalgruppe/activitiesWithMaalgruppe.builder';

const otherGroup = {
  title: 'Andre',
  components: {
    activitiesWithMaalgruppe: activitiesWithMaalgruppeBuilder(),
    drivingList: drivingListBuilder(),
  },
};

export default otherGroup;
