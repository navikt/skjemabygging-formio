import Field from 'formiojs/components/_classes/field/Field';
import FormioDataGrid from 'formiojs/components/datagrid/DataGrid';
import { scrollToAndSetFocus } from '../../../../util/focus-management/focus-management';
import resolveFormioDefault from '../../base/resolveFormioDefault';
import dataGridBuilder from './DataGrid.builder';
import dataGridForm from './DataGrid.form';

const FormioField = resolveFormioDefault(Field);
const DataGridBase = resolveFormioDefault(FormioDataGrid);
const originalRemoveRow = DataGridBase.prototype.removeRow;

class DataGrid extends DataGridBase {
  static schema() {
    return FormioField.schema({
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
    return DataGridBase.schema();
  }

  checkComponentValidity(_data, _dirty, _row, _options = {}) {
    // Override checkComponentValidity (kalles fra formiojs DataGrid.js#checkValidity) for å droppe
    // 'required'-validering av selve datagrid-komponenten. Komponentene inne i datagrid valideres separat.
    return true;
  }

  removeRow(index) {
    originalRemoveRow.call(this, index);
    // @ts-expect-error datagridKey finnes
    scrollToAndSetFocus(`[ref='${this.datagridKey}-addRow']:last-of-type`);
  }
}

export default DataGrid;
