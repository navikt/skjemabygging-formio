import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import FormioSelectBoxes from 'formiojs/components/selectboxes/SelectBoxes';
import BaseComponent from '../../base/BaseComponent';
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

  // Submission value is an object
  convertToObject(values: string[]): Record<string, boolean> {
    const componentValues = this.component?.values ?? [];
    return componentValues.reduce((acc, { value }) => ({ ...acc, [value]: values.includes(value) }), {});
  }

  // Aksel component value is an array
  convertToArray(values: Record<string, boolean>): string[] {
    if (!values) return [];
    return Object.entries(values)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
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
      <CheckboxGroup
        legend={this.getLabel()}
        description={this.getDescription()}
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
      </CheckboxGroup>,
    );
  }
}

export default SelectBoxes;
