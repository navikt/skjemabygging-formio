import NavDataFetcher from '../../../../components/data-fetcher/DataFetcher';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
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
        <NavDataFetcher
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

export default DataFetcher;
