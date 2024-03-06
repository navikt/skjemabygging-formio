import { DrivingListSubmission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
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

class DrivingList extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Kjøreliste',
      type: 'drivinglist',
      key: 'drivinglist',
      input: true,
      hideLabel: true,
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
    this.rerender();
  }

  override addError(metadataId: DrivingListMetadataId, message: string): void {
    super.addError(drivingListMetadata(metadataId).id, message);
  }

  addErrorOfType(metadataId: DrivingListMetadataId, errorType: DrivingListErrorType) {
    if (errorType === 'required') {
      super.addError(drivingListMetadata(metadataId).id, requiredError(metadataId, this.t.bind(this)));
    }
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

    this.renderErrors();

    if (this.componentErrors.length > 0) {
      return false;
    }

    return true;
  }

  renderReact(element) {
    element.render(
      <NavDrivingList
        onValueChange={(value) => this.onValueChange(value)}
        values={this.getValue()}
        appConfig={this.getAppConfig()}
        t={this.t.bind(this)}
        locale={this.getLocale()}
      />,
    );
  }
}

export default DrivingList;
