import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import FormioSelectBoxes from 'formiojs/components/selectboxes/SelectBoxes';
import Ready from '../../../../util/form/ready';
import BaseComponent from '../../base/BaseComponent';
import { blurHandler, focusHandler } from '../../base/focus-helpers';
import selectBoxesBuilder from './SelectBoxes.builder';
import selectBoxesForm from './SelectBoxes.form';

class SelectBoxes extends BaseComponent {
  _reactRefsReady = Ready();

  static schema() {
    return FormioSelectBoxes.schema({
      label: 'Flervalg',
      type: 'selectboxes',
      key: 'selectboxes',
      isNavCheckboxPanel: true, // FIXME: needed?
    });
  }

  static editForm() {
    return selectBoxesForm(SelectBoxes.schema().type);
  }

  static get builderInfo() {
    return selectBoxesBuilder();
  }

  get reactRefsReady() {
    return this._reactRefsReady.promise;
  }

  focus(focusData: any = {}) {
    this.reactReady.then(() => {
      const { focusedElementName } = focusData;
      if (focusedElementName) {
        const input = this.getRef(`input:${focusedElementName}`);
        input?.focus();
      } else {
        this.reactInstance?.focus();
      }
    });
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

  // FIXME: Should this use override?
  isEmpty(value = this.dataValue) {
    if (!value) return true;
    return !Object.values(value).some(Boolean);
  }

  renderReact(element) {
    const values = this.component!.values ?? [];
    this._reactRefsReady.reset();

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
        spellCheck={this.getSpellCheck()} // FIXME: needed?
        error={this.getError()}
        tabIndex={-1}
      >
        {values.map((obj, index, arr) => (
          <Checkbox
            key={obj.value}
            value={obj.value}
            description={this.getValueDescription(index)}
            onFocus={focusHandler(this, { focusedElementName: obj.value, skipEmit: true })}
            onBlur={blurHandler(this, { focusedElementName: obj.value, skipEmit: true })}
            ref={(ref) => {
              this.addRef(`input:${obj.value}`, ref);
              if (index === arr.length - 1) {
                this._reactRefsReady.resolve();
              }
            }}
          >
            {this.translate(obj.label)}
          </Checkbox>
        ))}
      </CheckboxGroup>,
    );
  }
}

export default SelectBoxes;
