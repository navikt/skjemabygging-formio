import { Checkbox as AkselCheckbox, CheckboxGroup } from '@navikt/ds-react';
import InnerHtml from '../../../../components/inner-html/InnerHtml';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import Label from '../../base/components/Label';
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

  get emptyValue() {
    return false;
  }

  changeHandler(selectedCheckboxes: string[]) {
    // There is always either 0 or 1 checkbox selected
    const isChecked = selectedCheckboxes.length > 0;
    super.handleChange(isChecked);
    this.rerender();
  }

  getCheckboxGroupValue() {
    return this.getValue() === true ? [this.component?.key] : [];
  }

  renderReact(element) {
    return element.render(
      <ComponentUtilsProvider component={this}>
        <CheckboxGroup
          legend={this.getLabel()}
          hideLegend={true}
          value={this.getCheckboxGroupValue()}
          onChange={(value) => this.changeHandler(value)}
          ref={(ref) => this.setReactInstance(ref)}
          className={this.getClassName()}
          readOnly={this.getReadOnly()}
          error={this.getError()}
        >
          <InnerHtml content={this.translate(this.component?.description)} />
          <AkselCheckbox value={this.component?.key}>
            <Label component={this.component} parent={this.parent} editFields={this.getEditFields()} />
          </AkselCheckbox>
        </CheckboxGroup>
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default Checkbox;
