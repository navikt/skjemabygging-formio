import Row from './Row';

const rowBuilder = () => {
  const schema = Row.schema();
  return {
    title: schema.label,
    schema: {
      ...schema,
    },
  };
};

export default rowBuilder;
