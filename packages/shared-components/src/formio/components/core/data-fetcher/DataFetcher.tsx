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

  getDataFromMetadata() {
    const componentKey = this.component?.key;
    return componentKey ? this.root.submission.metadata?.dataFetcher?.[componentKey] : undefined;
  }

  setShowAdditionalDescription(value: boolean) {
    this.showAdditionalDescription = value;
  }

  setMetadata(data: any) {
    const componentKey = this.component?.key;
    const submission = this.root.submission;
    if (!submission.metadata) {
      submission.metadata = {};
    }
    if (!submission.metadata.dataFetcher) {
      submission.metadata.dataFetcher = {};
    }
    if (componentKey && !submission.metadata.dataFetcher[componentKey]) {
      submission.metadata.dataFetcher[componentKey] = data;
    }
    this.triggerChange();
    this.redraw();
  }

  renderReact(element) {
    return element.render(
      <ComponentUtilsProvider component={this}>
        <NavDataFetcher
          label={
            <>
              <Label component={this.component} editFields={this.getEditFields()} /> (OBS! Skal ikke publiseres)
            </>
          }
          description={<Description component={this.component} />}
          value={this.getValue()}
          onChange={(value) => {
            this.changeHandler(value);
          }}
          className={this.getClassName()}
          queryParams={this.component?.queryParams}
          error={this.getError()}
          dataFetcherData={this.getDataFromMetadata()}
          setMetadata={(metaData) => this.setMetadata(metaData)}
          setShowAdditionalDescription={(value) => this.setShowAdditionalDescription(value)}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default DataFetcher;
