import activitiesBuilder from '../../core/activities/Activities.builder';
import maalgruppeBuilder from '../../core/maalgruppe/Maalgruppe.builder';

const activitiesWithMaalgruppeBuilder = () => {
  return {
    title: 'Aktiviteter og målgruppe',
    schema: {
      components: [activitiesBuilder().schema, maalgruppeBuilder().schema],
      type: 'container',
      hideLabel: true,
    },
  };
};

export default activitiesWithMaalgruppeBuilder;
