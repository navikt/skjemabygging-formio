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
    navDataGrid: {
      title: 'Data Grid',
      icon: 'th',
      group: 'data',
      documentation: '/userguide/#datagrid',
      key: 'datagrid',
      weight: 30,
      schema: {
        label: 'Data Grid',
        key: 'datagrid',
        type: 'datagrid',
        clearOnHide: true,
        input: true,
        isNavDataGrid: true,
        tree: true,
        components: [],
      },
    },
  },
};

export default dataPalett;
