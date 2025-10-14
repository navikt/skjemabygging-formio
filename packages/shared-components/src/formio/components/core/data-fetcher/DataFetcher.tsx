import {
  DataFetcherComponent,
  DataFetcherData,
  DataFetcherSourceId,
  SubmissionData,
} from '@navikt/skjemadigitalisering-shared-domain';
import NavDataFetcher from '../../../../components/data-fetcher/DataFetcher';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import utils from '../../../overrides/utils-overrides/utils-overrides';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import dataFetcherBuilder from './DataFetcher.builder';
import dataFetcherForm from './DataFetcher.form';
import { createMetadataObject } from './utils/submissionMetadataUtils';

class DataFetcher extends BaseComponent {
  static schema(dataFetcherSourceId: DataFetcherSourceId, label: string = 'Datahenter') {
    return BaseComponent.schema({
      label,
      type: 'dataFetcher',
      key: label.toLowerCase(),
      dataFetcherSourceId,
    });
  }

  static editForm() {
    return dataFetcherForm();
  }

  static get builderInfo() {
    return dataFetcherBuilder('Datahenter');
  }

  get component(): DataFetcherComponent {
    return super.component as DataFetcherComponent;
  }

  set component(component: DataFetcherComponent) {
    super.component = component;
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
    const metadata = utils.dataFetcher(this.path, this.root.submission);
    return metadata.ready ? metadata.apiResult : undefined;
  }

  setMetadata(data: DataFetcherData) {
    const submission = this.root.submission;
    if (!submission.metadata) {
      submission.metadata = {};
    }
    if (!submission.metadata.dataFetcher) {
      submission.metadata.dataFetcher = {};
    }
    if (this.path && !utils.dataFetcher(this.path, submission).apiResult) {
      const metadataObject = createMetadataObject(this.path, data);
      Object.assign(submission.metadata.dataFetcher, metadataObject);
      this.emit('submissionMetadataChanged', { ...submission.metadata });
    }
    this.triggerChange();
    this.redraw();
  }

  shouldSkipValidation(data?: SubmissionData, dirty?: boolean, row?: SubmissionData): boolean {
    const metadata = utils.dataFetcher(this.path, this.root.submission);
    return metadata.fetchDisabled || metadata.empty || super.shouldSkipValidation(data, dirty, row);
  }

  getShowOther() {
    return this.component?.showOther;
  }

  renderReact(element) {
    // TODO: Remove 'activities' as default value when all components has dataFetcherSourceId
    const dataFetcherSourceId = this.component?.dataFetcherSourceId || 'activities';
    return element.render(
      <ComponentUtilsProvider component={this}>
        <NavDataFetcher
          label={
            <>
              <Label component={this.component} editFields={this.getEditFields()} />
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
          dataFetcherSourceId={dataFetcherSourceId}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default DataFetcher;
