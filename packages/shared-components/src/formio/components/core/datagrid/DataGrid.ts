import { Formio } from '@formio/js';
import { scrollToAndSetFocus } from '../../../../util/focus-management/focus-management';
import dataGridBuilder from './DataGrid.builder';
import dataGridForm from './DataGrid.form';

const Field = Formio.Components.components.field;
const FormioDataGrid = Formio.Components.components.datagrid;

const originalRemoveRow = FormioDataGrid.prototype.removeRow;

class DataGrid extends FormioDataGrid {
  static schema() {
    return Field.schema({
      label: 'Repeterende data',
      key: 'datagrid',
      type: 'datagrid',
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
