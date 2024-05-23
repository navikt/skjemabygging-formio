import { Checkbox as AkselCheckbox, CheckboxGroup } from '@navikt/ds-react';
import BaseComponent from '../../base/BaseComponent';
import checkboxBuilder from './Checkbox.builder';
import checkboxForm from './Checkbox.form';

class Checkbox extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Avkryssingsboks',
      type: 'navCheckbox',
      key: 'Avkryssingsboks',
    });
  }

  static editForm() {
    return checkboxForm();
  }

  static get builderInfo() {
    return checkboxBuilder();
  }

  override setValue(value?: boolean): void {
    // Set initial value to false if it's not required
    if (value === null && this.component?.validate?.required === false) {
      super.updateValue(false, { modified: true });
    } else {
      super.setValue(value);
    }
  }

  changeHandler(selectedCheckboxes: string[], opts: { modified: boolean }) {
    // There is always either 0 or 1 checkbox selected
    const isChecked = selectedCheckboxes.length > 0;
    super.updateValue(isChecked, opts);
    this.rerender();
  }

  getCheckboxGroupValue() {
    return this.getValue() === true ? [this.component?.key] : [];
  }

  renderReact(element) {
    return element.render(
      <CheckboxGroup
        legend={this.getLabel()}
        hideLegend={true}
        value={this.getCheckboxGroupValue()}
        onChange={(value) => this.changeHandler(value, { modified: true })}
        ref={(ref) => this.setReactInstance(ref)}
        description={this.getDescription()}
        className={this.getClassName()}
        readOnly={this.getReadOnly()}
        error={this.getError()}
        tabIndex={-1}
      >
        <AkselCheckbox value={this.component?.key}>{this.getLabel()}</AkselCheckbox>
      </CheckboxGroup>,
    );
  }
}

export default Checkbox;
