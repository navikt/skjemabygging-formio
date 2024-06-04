import address from './Address';

const addressBuilder = () => {
  const schema = address.schema();
  return {
    title: 'Adresse',
    schema: {
      ...schema,
      prefillKey: 'sokerAdresser',
    },
  };
};

export default addressBuilder;
