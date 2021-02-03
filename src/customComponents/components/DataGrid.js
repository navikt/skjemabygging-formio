import DataGrid from "formiojs/components/datagrid/DataGrid";
import BaseComponent from "formiojs/components/_classes/component/Component.form";
import DataGridDisplayEditForm from "formiojs/components/datagrid/editForm/DataGrid.edit.display";
import DataGridDataEditForm from "formiojs/components/datagrid/editForm/DataGrid.edit.data";
import DataGridValidationEditForm from "formiojs/components/datagrid/editForm/DataGrid.edit.validation";
import DataGridAPIEditForm from "formiojs/components/_classes/component/editForm/Component.edit.api";
import DataGridConditionalEditForm from "formiojs/components/_classes/component/editForm/Component.edit.conditional";
import DataGridLogicEditForm from "formiojs/components/_classes/component/editForm/Component.edit.logic";
import DataGridLayoutEditForm from "formiojs/components/_classes/component/editForm/Component.edit.layout";

DataGrid.editForm = () => {
  return BaseComponent([
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
          weight: 410,
          input: true,
        },
      ],
    },
    {
      label: "Data",
      key: "data",
      components: DataGridDataEditForm,
    },
    {
      label: "Validation",
      key: "validation",
      components: DataGridValidationEditForm,
    },
    {
      label: "API",
      key: "api",
      components: DataGridAPIEditForm,
    },
    {
      label: "Conditional",
      key: "conditional",
      components: DataGridConditionalEditForm,
    },

    {
      label: "Logic",
      key: "logic",
      components: DataGridLogicEditForm,
    },
    {
      label: "Layout",
      key: "layout",
      components: DataGridLayoutEditForm,
    },
  ]);
};

export default DataGrid;
