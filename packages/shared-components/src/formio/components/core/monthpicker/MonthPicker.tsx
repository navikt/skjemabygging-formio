import { numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormioDay from 'formiojs/components/day/Day';
import { TFunction } from 'i18next';
import ReactMonthPicker from '../../../../components/monthpicker/MonthPicker';
import { validateDate } from '../../../../components/monthpicker/monthPickerValidation';
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

  override get errors() {
    return this.componentErrors;
  }

  override checkValidity(): boolean {
    this.removeAllErrors();
    const value = this.getValue() as string;
    const required = this.isRequired();
    const error = validateDate(value, {
      required,
      label: this.getLabel({ labelTextOnly: true }),
      translate: this.translate.bind(this) as TFunction,
      minYear: this.minYear(),
      maxYear: this.maxYear(),
    });

    if (error) {
      this.addError(error);
    }

    this.rerender();

    if (this.componentErrors.length > 0) {
      return false;
    }

    return true;
  }

  minYear() {
    const minYear = this.component?.validate?.minYear;
    const earliestAllowedDate = this.component?.earliestAllowedDate;

    if (minYear && String(minYear).length === 4 && numberUtils.isValidInteger(String(minYear))) {
      return minYear;
    }

    if (earliestAllowedDate) {
      return Number(new Date().getFullYear() + earliestAllowedDate);
    }
  }

  maxYear() {
    const maxYear = this.component?.validate?.maxYear;
    const latestAllowedDate = this.component?.latestAllowedDate;

    if (maxYear && String(maxYear).length === 4 && numberUtils.isValidInteger(String(maxYear))) {
      return maxYear;
    }

    if (latestAllowedDate) {
      return Number(new Date().getFullYear() + latestAllowedDate);
    }
  }

  override renderReact(element) {
    console.log('getvalue', this.getValue());
    return element.render(
      <ComponentUtilsProvider component={this}>
        <ReactMonthPicker
          minYear={this.minYear()}
          maxYear={this.maxYear()}
          onChange={this.onValueChange.bind(this)}
          value={this.getValue()}
          error={this.errors[0]?.message}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default MonthPicker;
