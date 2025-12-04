import NavRadio from '../../../../components/radio/Radio';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import radioBuilder from './Radio.builder';
import radioForm from './Radio.form';

class Radio extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Radiopanel',
      type: 'radiopanel',
      key: 'radiopanel',
      dataSrc: 'values',
      values: [
        {
          value: 'ja',
          label: 'Ja',
        },
        {
          value: 'nei',
          label: 'Nei',
        },
      ],
    });
  }

  static editForm() {
    return radioForm(Radio.schema().type);
  }

  static get builderInfo() {
    return radioBuilder();
  }

  get defaultSchema() {
    return Radio.schema();
  }

  changeHandler(value) {
    super.handleChange(value);
    this.rerender();
  }

  renderReact(element) {
    return element.render(
      <ComponentUtilsProvider component={this}>
        <NavRadio
          id={this.getId()}
          legend={<Label component={this.component} parent={this.parent} editFields={this.getEditFields()} />}
          value={this.getValue()}
          values={this.component!.values ?? []}
          onChange={(value) => this.changeHandler(value)}
          ref={(ref) => this.setReactInstance(ref, false)}
          description={<Description component={this.component} />}
          className={this.getClassName()}
          readOnly={this.getReadOnly()}
          error={this.getError()}
        />
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default Radio;
