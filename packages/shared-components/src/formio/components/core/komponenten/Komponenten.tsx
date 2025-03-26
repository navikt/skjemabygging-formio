import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import komponentenBuilder from './Komponenten.builder';
import komponentenForm from './Komponenten.form';

class Komponenten extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Komponenten',
      type: 'komponenten',
      key: 'Komponenten',
    });
  }

  static editForm() {
    return komponentenForm();
  }

  static get builderInfo() {
    return komponentenBuilder();
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

  getDataValues() {
    return [{ value: '', label: '' }];
  }

  // Aksel component value is an array
  convertToArray(values: Record<string, boolean>): string[] {
    if (!values) return [];
    return Object.entries(values)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
  }

  renderReact(element) {
    const componentValue = this.convertToArray(this.getValue());
    const values = this.getDataValues();
    return element.render(
      <ComponentUtilsProvider component={this}>
        <CheckboxGroup
          legend={<Label component={this.component} editFields={this.getEditFields()} />}
          description={<Description component={this.component} />}
          value={componentValue}
          onChange={(value) => this.changeHandler(value)}
          ref={(ref) => this.setReactInstance(ref)}
          className={this.getClassName()}
          readOnly={this.getReadOnly()}
          error={this.getError()}
          tabIndex={-1}
        >
          {values.map((obj, index) => (
            <Checkbox key={obj.value} value={obj.value} description={this.getValueDescription(index)}>
              {this.translate(obj.label)}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </ComponentUtilsProvider>,
    );
  }
}

export default Komponenten;
