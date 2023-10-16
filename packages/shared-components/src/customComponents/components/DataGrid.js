import Field from 'formiojs/components/_classes/field/Field';
import DataGrid from 'formiojs/components/datagrid/DataGrid';
import DataGridEditForm from 'formiojs/components/datagrid/DataGrid.form';
import DataGridDataEditForm from 'formiojs/components/datagrid/editForm/DataGrid.edit.data';
import DataGridDisplayEditForm from 'formiojs/components/datagrid/editForm/DataGrid.edit.display';
import FormBuilderOptions from '../../Forms/form-builder-options';
import { scrollToAndSetFocus } from '../../util/focus-management';
import { description } from './fields/description.js';

const originalAddRow = DataGrid.prototype.addRow;
const originalRemoveRow = DataGrid.prototype.removeRow;

class NavDataGrid extends DataGrid {
  static get builderInfo() {
    return FormBuilderOptions.builder.data.components.navDataGrid;
  }

  static editForm(...extend) {
    return DataGridEditForm([
      {
        label: 'Display',
        key: 'display',
        components: [
          ...description,
          ...DataGridDisplayEditForm,
          {
            type: 'textfield',
            label: 'Row title',
            key: 'rowTitle',
            weight: 2,
            input: true,
          },
          {
            type: 'textfield',
            label: 'Remove Text',
            key: 'removeAnother',
            tooltip: 'Set the text of the Remove button.',
            placeholder: 'Remove',
            weight: 412,
            input: true,
          },
          {
            key: 'labelPosition',
            ignore: true,
          },
          {
            key: 'tooltip',
            ignore: true,
          },
          {
            key: 'disabled',
            ignore: true,
          },
          {
            key: 'customClass',
            ignore: true,
          },
          {
            key: 'hidden',
            ignore: true,
          },
          {
            key: 'autofocus',
            ignore: true,
          },
          {
            key: 'tableView',
            ignore: true,
          },
          {
            key: 'modalEdit',
            ignore: true,
          },
          {
            key: 'tabindex',
            ignore: true,
          },
          { key: 'reorder', ignore: true },
          { key: 'addAnotherPosition', ignore: true },
          { key: 'layoutFixed', ignore: true },
          { key: 'enableRowGroups', ignore: true },
          { key: 'initEmpty', ignore: true },
          { key: 'hideLabel', ignore: true },
          { key: 'disableAddingRemovingRows', ignore: true },
        ],
      },
      {
        label: 'Data',
        key: 'data',
        components: [
          ...DataGridDataEditForm,
          {
            key: 'defaultValue',
            ignore: true,
          },
          {
            key: 'persistent',
            ignore: true,
          },

          {
            key: 'protected',
            ignore: true,
          },
          {
            key: 'dbIndex',
            ignore: true,
          },
          {
            key: 'encrypted',
            ignore: true,
          },
          {
            key: 'redrawOn',
            ignore: true,
          },
          {
            key: 'calculateServer',
            ignore: true,
          },
          {
            key: 'allowCalculateOverride',
            ignore: true,
          },
          {
            key: 'dataType',
            ignore: true,
          },
        ],
      },
      {
        key: 'api',
        components: [{ key: 'tags', ignore: true }],
      },
      {
        key: 'validation',
        ignore: true,
      },
      {
        key: 'logic',
        ignore: true,
        components: false,
      },
      {
        key: 'layout',
        ignore: true,
        components: false,
      },

      ...extend,
    ]);
  }

  static schema(...extend) {
    return Field.schema({
      ...FormBuilderOptions.builder.data.components.navDataGrid.schema,
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
