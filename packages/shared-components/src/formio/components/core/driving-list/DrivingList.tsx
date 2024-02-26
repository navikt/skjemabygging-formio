import NavDrivingList, { DrivingListValues } from '../../../../components/drivinglist/NavDrivingList';
import BaseComponent from '../../base/BaseComponent';
import drivingListBuilder from './DrivingList.builder';
import drivingListForm from './DrivingList.form';
import { getComponentInfo, requiredError } from './DrivingList.info';

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

  isValidParking(value: string) {
    if (value === '') return true;
    return /^\d+$/.test(value);
  }

  override checkValidity(data: any): boolean {
    this.removeAllErrors();
    const componentData = data[this.defaultSchema.key] as DrivingListValues;

    const submissionMethod = this.getAppConfig()?.submissionMethod;

    if (submissionMethod === 'paper') {
      const parkingSelected = componentData?.parking !== undefined && componentData?.parking !== null;

      if (!componentData?.selectedDate) {
        this.addError(getComponentInfo('datePicker').id, requiredError('datePicker', this.t.bind(this)));
      }

      if (!componentData?.selectedPeriodType) {
        this.addError(getComponentInfo('periodType').id, requiredError('periodType', this.t.bind(this)));
      }

      if (!parkingSelected) {
        this.addError(getComponentInfo('parkingRadio').id, requiredError('parkingRadio', this.t.bind(this)));
      }

      const allSelected = componentData?.selectedDate && componentData?.selectedPeriodType && parkingSelected;

      if (allSelected && componentData.dates?.length === 0) {
        this.addError(getComponentInfo('dates').id, requiredError('dates', this.t.bind(this)));
      }
    } else {
      if (componentData?.dates?.length === 0) {
        this.addError(getComponentInfo('dates').id, requiredError('dates', this.t.bind(this)));
      }
    }

    if (componentData?.dates?.some((date) => !this.isValidParking(date.parking))) {
      this.addError(getComponentInfo('dates').id, this.t('Parkeringsutgiftene må være et gyldig beløp'));
    }

    if (componentData?.dates?.some((date) => Number(date.parking) > 100)) {
      this.addError(
        getComponentInfo('dates').id,
        this.t(
          'Du kan ikke legge inn parkeringsutgifter over 100 kroner i den elektroniske kjørelisten. Hvis du har parkeringsutgifter over 100 kroner per dag må du sende inn kjøreliste på skjema NAV 00-01.01 og legge ved kvitteringer som dokumenterer utgiften.',
        ),
      );
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
