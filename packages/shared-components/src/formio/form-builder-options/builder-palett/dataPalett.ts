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
    navDataGrid: dataGridBuilder(),
  },
};

export default dataPalett;
