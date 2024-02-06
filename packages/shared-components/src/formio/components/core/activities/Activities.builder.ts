import Activities from './Activities';

const activitiesBuilder = () => {
  const schema = Activities.schema();
  return {
    title: 'Aktiviteter',
    schema: {
      ...schema,
    },
  };
};

export default activitiesBuilder;
