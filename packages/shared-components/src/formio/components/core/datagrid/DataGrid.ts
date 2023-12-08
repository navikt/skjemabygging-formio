import Field from 'formiojs/components/_classes/field/Field';
import FormioDataGrid from 'formiojs/components/datagrid/DataGrid';
import { scrollToAndSetFocus } from '../../../../util/focus-management/focus-management';
import FormBuilderOptions from '../../../form-builder-options';
import dataGridForm from './DataGrid.form';

const originalRemoveRow = FormioDataGrid.prototype.removeRow;

class DataGrid extends FormioDataGrid {
  static schema(...extend) {
    return Field.schema(
      {
        ...FormBuilderOptions.builder.data.components.navDataGrid.schema,
      },
      ...extend,
    );
  }

  static editForm() {
    return dataGridForm();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.data.components.navDataGrid;
  }

  get defaultSchema() {
    return DataGrid.schema();
  }

  removeRow(index) {
    originalRemoveRow.call(this, index);
    // @ts-ignore
    scrollToAndSetFocus(`[ref='${this.datagridKey}-addRow']:last-of-type`);
  }
}

export default DataGrid;
