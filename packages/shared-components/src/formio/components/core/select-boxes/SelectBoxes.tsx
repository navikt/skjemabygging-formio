import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import FormioSelectBoxes from 'formiojs/components/selectboxes/SelectBoxes';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import { blurHandler, focusHandler } from '../../base/focus-helpers';
import { getSelectedValuesAsList, getSelectedValuesMap } from '../../utils';
import selectBoxesBuilder from './SelectBoxes.builder';
import selectBoxesForm from './SelectBoxes.form';

class SelectBoxes extends BaseComponent {
  static schema() {
    return FormioSelectBoxes.schema({
      label: 'Flervalg',
      type: 'selectboxes',
      key: 'selectboxes',
    });
  }

  static editForm() {
    return selectBoxesForm(SelectBoxes.schema().type);
  }

  static get builderInfo() {
    return selectBoxesBuilder();
  }

  // Map values from Aksel component (on format ['value1', 'value2']) to object (on format {value1: true, value2: true})
  // We store the values as a map of selected values in submission data to simplify conditionals
  convertToObject(values: string[]): Record<string, boolean> {
    return getSelectedValuesMap(this.component?.values ?? [], values);
  }

  // Map values from object (on format {value1: true, value2: true}) to array (on format ['value1', 'value2']) as expected by Aksel component
  convertToArray(values: Record<string, boolean>): string[] {
    return getSelectedValuesAsList(values);
  }

  changeHandler(values: string[]) {
    super.handleChange(this.convertToObject(values));
    this.rerender();
  }

  // Only empty if the values are all false
  override isEmpty(value = this.dataValue) {
    if (!value) return true;
    return !Object.values(value).some(Boolean);
  }

  renderReact(element) {
    const values = this.component!.values ?? [];

    const componentValue = this.convertToArray(this.getValue());

    return element.render(
      <ComponentUtilsProvider component={this}>
        <CheckboxGroup
          legend={<Label component={this.component} parent={this.parent} editFields={this.getEditFields()} />}
          description={<Description component={this.component} />}
          value={componentValue}
          onChange={(value) => this.changeHandler(value)}
          ref={(ref) => this.setReactInstance(ref, false)}
          className={this.getClassName()}
          readOnly={this.getReadOnly()}
          error={this.getError()}
          tabIndex={-1}
        >
          {values.map((obj, index) => (
            <Checkbox
              key={obj.value}
              value={obj.value}
              description={this.getValueDescription(index)}
              onFocus={focusHandler(this, { elementId: obj.value, skipEmit: true })}
              onBlur={blurHandler(this, { elementId: obj.value, skipEmit: true })}
              ref={(r) => {
                this.addRef(obj.value, r);
                if (r && this.reactResolve && index === values.length - 1) {
                  this.reactResolve();
                }
              }}
            >
              {this.translate(obj.label)}
            </Checkbox>
          ))}
        </CheckboxGroup>
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default SelectBoxes;
