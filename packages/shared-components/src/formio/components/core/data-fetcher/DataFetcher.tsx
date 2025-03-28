import NavDataFetcher from '../../../../components/data-fetcher/DataFetcher';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import { getSelectedValuesAsList } from '../../utils';
import dataFetcherBuilder from './DataFetcher.builder';
import dataFetcherForm from './DataFetcher.form';

class DataFetcher extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Aktivitetsvelger',
      type: 'dataFetcher',
      key: 'dataFetcher',
    });
  }

  static editForm() {
    return dataFetcherForm();
  }

  static get builderInfo() {
    return dataFetcherBuilder();
  }

  changeHandler(value: Record<string, boolean>) {
    super.handleChange(value);
    this.rerender();
  }

  get emptyValue() {
    return {};
  }

  // Only empty if the values are all false
  override isEmpty(value = this.dataValue) {
    if (!value) return true;
    return !Object.values(value).some(Boolean);
  }

  renderReact(element) {
    const componentValue = getSelectedValuesAsList(this.getValue());
    console.log(componentValue);
    return element.render(
      <ComponentUtilsProvider component={this}>
        <NavDataFetcher
          label={
            <>
              <Label component={this.component} editFields={this.getEditFields()} /> OBS! Skal ikke publiseres
            </>
          }
          description={<Description component={this.component} />}
          value={this.getValue()}
          onChange={(value) => {
            this.changeHandler(value);
          }}
          className={this.getClassName()}
          error={this.getError()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default DataFetcher;
