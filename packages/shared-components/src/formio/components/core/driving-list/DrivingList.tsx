import { dateUtils, DrivingListSubmission, DrivingListValues, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavDrivingList from '../../../../components/drivinglist/NavDrivingList';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import drivingListBuilder from './DrivingList.builder';
import drivingListForm from './DrivingList.form';
import {
  DrivingListErrorType,
  drivingListMetadata,
  DrivingListMetadataId,
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
    super.handleChange(value);

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

  addErrorOfType(metadataId: DrivingListMetadataId, errorType: DrivingListErrorType) {
    if (errorType === 'required') {
      super.addError(requiredError(metadataId, this.translate.bind(this)), drivingListMetadata(metadataId).id);
    }
  }

  override checkValidity(): boolean {
    this.removeAllErrors();
    const componentData = this.getValue() as DrivingListSubmission;

    if (this.isSubmissionPaper()) {
      const parkingSelected = componentData?.parking !== undefined && componentData?.parking !== null;
      const dateSelected = !!componentData?.selectedDate;
      const allSelected = !!componentData?.selectedDate && parkingSelected;

      if (!dateSelected) {
        this.addErrorOfType('datePicker', 'required');
      }

      if (!parkingSelected) {
        this.addErrorOfType('parkingRadio', 'required');
      }

      if (allSelected && componentData.dates?.length === 0) {
        this.addErrorOfType('dates', 'required');
      }
    } else if (this.isSubmissionDigital()) {
      if (!componentData?.selectedVedtaksId) {
        this.addErrorOfType('activityRadio', 'required');
      }
      if (!componentData?.dates || componentData?.dates?.length === 0) {
        this.addErrorOfType('dates', 'required');
      }
    }

    componentData?.dates?.forEach((date) => {
      if (!isValidParking(date.parking)) {
        const message = this.translate(TEXTS.validering.validParkingExpenses, {
          dato: dateUtils.toLocaleDate(date.date),
        });
        this.addError(message, `dates:${date.date}:parking`);
      }
      if (Number(date.parking) > 100 && this.isSubmissionDigital()) {
        this.addError(this.translate(TEXTS.validering.parkingExpensesAboveHundred), `dates:${date.date}:parking`);
      }
    });

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
    // TODO: Delete DrivingListProvider and use prop drilling instead
    element.render(
      <ComponentUtilsProvider component={this}>
        <DrivingListProvider updateValues={this.updateValues.bind(this)} values={this.getValue()}>
          <NavDrivingList />
        </DrivingListProvider>
      </ComponentUtilsProvider>,
    );
  }
}

export default DrivingList;
