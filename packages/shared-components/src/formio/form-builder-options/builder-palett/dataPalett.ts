import containerBuilder from '../../components/core/container/Container.builder';
import dataGridBuilder from '../../components/core/datagrid/DataGrid.builder';

const dataPalett = {
  title: 'Data',
  components: {
    datagrid: {
      ignore: true,
    },
    editgrid: {
      ignore: true,
    },
    hidden: {
      ignore: true,
    },
    datamap: null,
    tree: null,
    container: containerBuilder(),
    navDataGrid: dataGridBuilder(),
  },
};

export default dataPalett;
