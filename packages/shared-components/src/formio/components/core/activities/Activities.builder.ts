import Activities from './Activities';

const activitiesBuilder = () => {
  const schema = Activities.schema();
  return {
    title: 'Aktiviteter',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default activitiesBuilder;
