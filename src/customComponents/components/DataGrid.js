import DataGrid from "formiojs/components/datagrid/DataGrid";
import DataGridEditForm from "formiojs/components/datagrid/DataGrid.form";
import DataGridDisplayEditForm from "formiojs/components/datagrid/editForm/DataGrid.edit.display";

DataGrid.editForm = () => {
  return DataGridEditForm([
    {
      label: "Display",
      key: "display",
      components: [
        ...DataGridDisplayEditForm,
        {
          type: "textfield",
          label: "Remove Text",
          key: "removeAnother",
          tooltip: "Set the text of the Remove button.",
          placeholder: "Remove",
          weight: 412,
          input: true,
        },
      ],
    },
  ]);
};

export default DataGrid;
