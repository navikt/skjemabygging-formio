import AreaCodeSelect from './AreaCodeSelect';

const areaCodeSelectBuilder = () => {
  return {
    title: 'Landskode',
    schema: {
      ...AreaCodeSelect.schema(),
      validate: {
        required: true,
      },
    },
  };
};

export default areaCodeSelectBuilder;
