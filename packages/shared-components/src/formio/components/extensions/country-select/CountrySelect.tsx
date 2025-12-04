import { Address as AddressDomain } from '@navikt/skjemadigitalisering-shared-domain';
import NavCountrySelect from '../../../../components/select/country/CountrySelect';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import countrySelectBuilder from './CountrySelect.builder';
import countrySelectForm from './CountrySelect.form';

class CountrySelect extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Velg land',
      type: 'landvelger',
      key: 'landvelger',
      validate: {
        required: true,
      },
    });
  }

  getIgnoreOptions() {
    return this.component?.ignoreNorway ? ['NO'] : [];
  }

  static editForm() {
    return countrySelectForm(CountrySelect.schema().type);
  }

  static get builderInfo() {
    return countrySelectBuilder();
  }

  handleChange(value: AddressDomain) {
    super.handleChange(value);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <NavCountrySelect
          id={this.getId()}
          value={this.getValue()}
          ref={(ref) => this.setReactInstance(ref)}
          onChange={this.handleChange.bind(this)}
          label={<Label component={this.component} parent={this.parent} editFields={this.getEditFields()} />}
          description={<Description component={this.component} />}
          fieldSize={this.getFieldSize()}
          readOnly={this.getReadOnly()}
          error={this.getError()}
          ignoreOptions={this.getIgnoreOptions()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default CountrySelect;
