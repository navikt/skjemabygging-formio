import DataGrid from "formiojs/components/datagrid/DataGrid";
import DataGridEditForm from "formiojs/components/datagrid/DataGrid.form";
import DataGridDisplayEditForm from "formiojs/components/datagrid/editForm/DataGrid.edit.display";
import DataGridDataEditForm from "formiojs/components/datagrid/editForm/DataGrid.edit.data";
import FormioReactComponent from "../FormioReactComponent";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import { scrollToAndSetFocus } from "../../util/focus-management";

const originalAddRow = DataGrid.prototype.addRow;
const originalRemoveRow = DataGrid.prototype.removeRow;

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
      {
        label: "Data",
        key: "data",
        components: [
          ...DataGridDataEditForm,
          {
            key: "defaultValue",
            ignore: true,
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

  addRow() {
    originalAddRow.call(this);
    const lastRowSelector = `[ref='${this.datagridKey}-row']:last-of-type`;
    scrollToAndSetFocus(`${lastRowSelector} input, ${lastRowSelector} select, ${lastRowSelector} textarea`);
  }

  removeRow(index) {
    originalRemoveRow.call(this, index);
    scrollToAndSetFocus(`[ref='${this.datagridKey}-addRow']:last-of-type`);
  }
}

export default NavDataGrid;
