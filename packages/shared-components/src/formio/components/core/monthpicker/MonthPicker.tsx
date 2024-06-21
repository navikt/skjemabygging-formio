import FormioDay from 'formiojs/components/day/Day';
import ReactMonthPicker from '../../../../components/monthpicker/MonthPicker';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import monthPickerBuilder from './MonthPicker.builder';
import monthPickerForm from './MonthPicker.form';

class MonthPicker extends BaseComponent {
  static schema() {
    return FormioDay.schema({
      label: 'Mnd / år (ny)',
      type: 'monthPicker',
      key: 'monthYear',
    });
  }

  static editForm() {
    return monthPickerForm();
  }

  static get builderInfo() {
    return monthPickerBuilder();
  }

  onValueChange(value) {
    super.handleChange(value);
    this.rerender();
  }

  override renderReact(element) {
    console.log('getvalue', this.getValue());
    return element.render(
      <ComponentUtilsProvider component={this}>
        <ReactMonthPicker
          minYear={this.component?.validate?.min}
          maxYear={this.component?.validate?.max}
          onChange={this.onValueChange.bind(this)}
          value={this.getValue()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default MonthPicker;
