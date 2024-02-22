import DrivingList from './DrivingList';

const drivingListBuilder = () => {
  const schema = DrivingList.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default drivingListBuilder;