import containerBuilder from '../components/core/container/Container.builder';
import dataGridBuilder from '../components/core/datagrid/DataGrid.builder';
import formGroupBuilder from '../components/core/form-group/FormGroup.builder';

const layoutGroup = {
  title: 'Layout',
  components: {
    navSkjemagruppe: formGroupBuilder(),
    container: containerBuilder(),
    navDataGrid: dataGridBuilder(),
  },
};

export default layoutGroup;
