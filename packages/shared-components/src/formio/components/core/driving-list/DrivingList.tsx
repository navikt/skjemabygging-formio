import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavDrivingList from '../../../../components/drivinglist/NavDrivingList';
import BaseComponent from '../../base/BaseComponent';
import drivingListBuilder from './DrivingList.builder';
import drivingListForm from './DrivingList.form';
import {
  DrivingListErrorType,
  DrivingListMetadataId,
  DrivingListSubmission,
  drivingListMetadata,
  isValidParking,
  requiredError,
} from './DrivingList.utils';

class DrivingList extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Legg til kjøreliste for en eller flere perioder',
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

  override checkValidity(data: any): boolean {
    this.removeAllErrors();
    const componentData = data[this.defaultSchema.key] as DrivingListSubmission;

    const submissionMethod = this.getAppConfig()?.submissionMethod;
    // FIXME: Check innsending=INGEN
    if (submissionMethod === 'paper') {
      const parkingSelected = componentData?.parking !== undefined && componentData?.parking !== null;

      if (!componentData?.selectedDate) {
        this.addErrorOfType('datePicker', 'required');
      }

      if (!componentData?.selectedPeriodType) {
        this.addErrorOfType('periodType', 'required');
      }

      if (!parkingSelected) {
        this.addErrorOfType('parkingRadio', 'required');
      }

      const allSelected = componentData?.selectedDate && componentData?.selectedPeriodType && parkingSelected;

      if (allSelected && componentData.dates?.length === 0) {
        this.addErrorOfType('dates', 'required');
      }
    } else {
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
    console.log(this.getValue());
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
