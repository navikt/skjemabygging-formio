import { defaultBuilderSchema } from '../../base/builderHelper';
import DataGrid from './DataGrid';

const dataGridBuilder = () => {
  const schema = DataGrid.schema();
  return {
    title: schema.label,
    group: 'data',
    schema: {
      ...schema,
      ...defaultBuilderSchema(),
    },
  };
};

export default dataGridBuilder;
