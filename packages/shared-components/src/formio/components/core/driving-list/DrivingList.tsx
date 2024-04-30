import { dateUtils, DrivingListSubmission, DrivingListValues, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavDrivingList from '../../../../components/drivinglist/NavDrivingList';
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

  addErrorOfType(metadataId: DrivingListMetadataId, errorType: DrivingListErrorType) {
    if (errorType === 'required') {
      super.addError(requiredError(metadataId, this.t.bind(this)), drivingListMetadata(metadataId).id);
    }
  }

  getComponentError(elementId: string) {
    return this.componentErrors.find((error) => error.elementId === elementId)?.message;
  }

  override checkValidity(): boolean {
    this.removeAllErrors();
    const componentData = this.getValue() as DrivingListSubmission;

    const submissionMethod = this.getAppConfig()?.submissionMethod;

    if (submissionMethod === 'paper') {
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
    } else if (submissionMethod === 'digital') {
      if (!componentData?.selectedVedtaksId) {
        this.addErrorOfType('activityRadio', 'required');
      }
      if (!componentData?.dates || componentData?.dates?.length === 0) {
        this.addErrorOfType('dates', 'required');
      }
    }

    componentData?.dates?.forEach((date) => {
      if (!isValidParking(date.parking)) {
        const message = this.t(TEXTS.validering.validParkingExpenses, { dato: dateUtils.toLocaleDate(date.date) });
        this.addError(message, `dates:${date.date}:parking`);
      }
      if (Number(date.parking) > 100 && this.getAppConfig().submissionMethod === 'digital') {
        this.addError(this.t(TEXTS.validering.parkingExpensesAboveHundred), `dates:${date.date}:parking`);
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
    element.render(
      <DrivingListProvider
        updateValues={this.updateValues.bind(this)}
        values={this.getValue()}
        appConfig={this.getAppConfig()}
        t={this.t.bind(this)}
        locale={this.getLocale()}
        getComponentError={this.getComponentError.bind(this)}
        addRef={this.addRef.bind(this)}
      >
        <NavDrivingList />
      </DrivingListProvider>,
    );
  }
}

export default DrivingList;
