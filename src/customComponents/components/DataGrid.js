import DataGrid from "formiojs/components/datagrid/DataGrid";
import DataGridEditForm from "formiojs/components/datagrid/DataGrid.form";
import DataGridDisplayEditForm from "formiojs/components/datagrid/editForm/DataGrid.edit.display";
import FormioReactComponent from "../FormioReactComponent";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";

class NavDataGrid extends DataGrid {
  static get builderInfo() {
    return FormBuilderOptions.builder.data.components.navDataGrid;
  }

  static editForm(...extend) {
    return DataGridEditForm([
      {
        label: "Display",
        key: "display",
        components: [
          ...DataGridDisplayEditForm,
          {
            type: "textfield",
            label: "Row title",
            key: "rowTitle",
            weight: 2,
            input: true,
          },
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
      ...extend,
    ]);
  }

  static schema(...extend) {
    return FormioReactComponent.schema({
      ...FormBuilderOptions.builder.data.components.navDataGrid,
      ...extend,
    });
  }
}

export default NavDataGrid;
