import { DrivingListSubmission, DrivingListValues, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavDrivingList from '../../../../components/drivinglist/NavDrivingList';
import BaseComponent from '../../base/BaseComponent';
import drivingListBuilder from './DrivingList.builder';
import drivingListForm from './DrivingList.form';
import {
  DrivingListErrorType,
  DrivingListMetadataId,
  drivingListMetadata,
  isValidParking,
  requiredError,
} from './DrivingList.utils';
import { DrivingListProvider } from './DrivingListContext';

class DrivingList extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Kjøreliste',
      type: 'drivinglist',
      key: 'drivinglist',
      input: true,
    });
  }

  static editForm() {
    return drivingListForm();
  }

  static get builderInfo() {
    return drivingListBuilder();
  }

  onValueChange(value) {
    super.updateValue(value, { modified: true });

    // If next button has been clicked (submitted), check the whole form for errors
    if (this.root.submitted) {
      this.checkValidity();
    } else {
      this.rerender();
    }
  }

  override get errors() {
    return this.componentErrors;
  }

  override addError(metadataId: DrivingListMetadataId, message: string): void {
    super.addError(drivingListMetadata(metadataId).id, message);
  }

  addErrorOfType(metadataId: DrivingListMetadataId, errorType: DrivingListErrorType) {
    if (errorType === 'required') {
      super.addError(drivingListMetadata(metadataId).id, requiredError(metadataId, this.t.bind(this)));
    }
  }

  getComponentError(metadataId: DrivingListMetadataId) {
    return this.componentErrors.find((error) => error.metadataId === metadataId)?.message;
  }

  override checkValidity(): boolean {
    this.removeAllErrors();
    const componentData = this.getValue() as DrivingListSubmission;

    const submissionMethod = this.getAppConfig()?.submissionMethod;

    if (submissionMethod === 'paper') {
      const parkingSelected = componentData?.parking !== undefined && componentData?.parking !== null;
      const periodSelected = !!componentData?.selectedPeriodType;
      const dateSelected = !!componentData?.selectedDate;
      const allSelected = !!componentData?.selectedDate && !!componentData?.selectedPeriodType && parkingSelected;

      if (!periodSelected) {
        this.addErrorOfType('periodType', 'required');
      }

      if (periodSelected && !dateSelected) {
        this.addErrorOfType('datePicker', 'required');
      }

      if (periodSelected && !parkingSelected) {
        this.addErrorOfType('parkingRadio', 'required');
      }

      if (allSelected && componentData.dates?.length === 0) {
        this.addErrorOfType('dates', 'required');
      }
    } else if (submissionMethod === 'digital') {
      if (!componentData?.selectedVedtaksId) {
        this.addErrorOfType('activityRadio', 'required');
      }
      if (componentData?.dates?.length === 0) {
        this.addErrorOfType('dates', 'required');
      }
    }

    if (componentData?.dates?.some((date) => !isValidParking(date.parking))) {
      this.addError('dates', this.t(TEXTS.validering.validParkingExpenses));
    }

    if (componentData?.dates?.some((date) => Number(date.parking) > 100)) {
      this.addError('dates', this.t(TEXTS.validering.parkingExpensesAboveHundred));
    }

    this.rerender();

    if (this.componentErrors.length > 0) {
      return false;
    }

    return true;
  }

  updateValues(multipleValues: DrivingListValues) {
    this.onValueChange({ ...this.getValue(), ...multipleValues });
  }

  renderReact(element) {
    element.render(
      <DrivingListProvider
        updateValues={this.updateValues.bind(this)}
        values={this.getValue()}
        appConfig={this.getAppConfig()}
        t={this.t.bind(this)}
        locale={this.getLocale()}
        getComponentError={this.getComponentError.bind(this)}
      >
        <NavDrivingList />
      </DrivingListProvider>,
    );
  }
}

export default DrivingList;
