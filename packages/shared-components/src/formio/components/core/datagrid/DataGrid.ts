import Field from 'formiojs/components/_classes/field/Field';
import FormioDataGrid from 'formiojs/components/datagrid/DataGrid';
import { scrollToAndSetFocus } from '../../../../util/focus-management/focus-management';
import dataGridBuilder from './DataGrid.builder';
import dataGridForm from './DataGrid.form';

const originalRemoveRow = FormioDataGrid.prototype.removeRow;

class DataGrid extends FormioDataGrid {
  static schema() {
    return Field.schema({
      label: 'Repeterende data',
      key: 'datagrid',
      type: 'datagrid',
      clearOnHide: true,
      input: true,
      isNavDataGrid: true,
      tree: true,
      components: [],
    });
  }

  static editForm() {
    return dataGridForm();
  }

  static get builderInfo() {
    return dataGridBuilder();
  }

  get defaultSchema() {
    // Ved å bruke FormioDataGrid.schema() så får man formio sin datagrid i editoren.
    return FormioDataGrid.schema();
  }

  removeRow(index) {
    originalRemoveRow.call(this, index);
    // @ts-ignore
    scrollToAndSetFocus(`[ref='${this.datagridKey}-addRow']:last-of-type`);
  }
}

export default DataGrid;
