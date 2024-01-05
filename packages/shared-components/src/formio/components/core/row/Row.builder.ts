import Row from './Row';

const rowBuilder = () => {
  const schema = Row.schema();
  return {
    title: schema.label,
    group: 'layout',
    schema: {
      ...schema,
    },
  };
};

export default rowBuilder;
