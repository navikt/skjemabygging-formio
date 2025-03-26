import ReactKomponenten from '../../../../components/komponenten/ReactKomponenten';
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
      key: 'komponenten',
    });
  }

  static editForm() {
    return komponentenForm();
  }

  static get builderInfo() {
    return komponentenBuilder();
  }

  get emptyValue() {
    return [];
  }

  changeHandler(selectedCheckboxes: string[]) {
    super.handleChange(selectedCheckboxes);
    this.rerender();
  }

  renderReact(element) {
    return element.render(
      <ComponentUtilsProvider component={this}>
        <ReactKomponenten
          label={<Label component={this.component} editFields={this.getEditFields()} />}
          description={<Description component={this.component} />}
          value={this.getValue()}
          onChange={(value) => this.changeHandler(value)}
          className={this.getClassName()}
          error={this.getError()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default Komponenten;
