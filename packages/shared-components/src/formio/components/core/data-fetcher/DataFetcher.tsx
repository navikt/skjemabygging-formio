import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';
import NavDataFetcher from '../../../../components/data-fetcher/DataFetcher';
import { DataFetcherData } from '../../../../components/data-fetcher/types';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import utils from '../../../overrides/utils-overrides/utils-overrides';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
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

  getDataFromMetadata(): DataFetcherData | undefined {
    const metadata = utils.dataFetcher(this.component?.key, this.root.submission);
    return metadata.ready ? metadata.apiResult : undefined;
  }

  setMetadata(data: DataFetcherData) {
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

  shouldSkipValidation(data?: SubmissionData, dirty?: boolean, row?: SubmissionData): boolean {
    const metadata = utils.dataFetcher(this.component?.key, this.root.submission);
    return metadata.fetchDisabled || metadata.empty || super.shouldSkipValidation(data, dirty, row);
  }

  getShowOther() {
    return this.component?.showOther;
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
          additionalDescription={<AdditionalDescription component={this.component} />}
          value={this.getValue()}
          onChange={(value) => {
            this.changeHandler(value);
          }}
          className={this.getClassName()}
          queryParams={this.component?.queryParams}
          error={this.getError()}
          dataFetcherData={this.getDataFromMetadata()}
          setMetadata={(metaData) => this.setMetadata(metaData)}
          ref={(ref) => this.setReactInstance(ref)}
          showOther={this.getShowOther()}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default DataFetcher;
