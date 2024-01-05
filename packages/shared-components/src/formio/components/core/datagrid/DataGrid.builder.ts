import DataGrid from './DataGrid';

const dataGridBuilder = () => {
  const schema = DataGrid.schema();
  return {
    title: schema.label,
    group: 'data',
    schema: {
      ...schema,
      validateOn: 'blur',
      validate: {
        required: true,
      },
    },
  };
};

export default dataGridBuilder;
