import NavDrivingList from '../../../../components/drivinglist/NavDrivingList';
import BaseComponent from '../../base/BaseComponent';
import drivingListBuilder from './DrivingList.builder';
import drivingListForm from './DrivingList.form';

class DrivingList extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      label: 'Legg til kjøreliste for en eller flere perioder',
      type: 'drivinglist',
      key: 'drivinglist',
      input: true,
      hideLabel: true,
      multiple: true,
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

  renderReact(element) {
    console.log(this.getValue());
    element.render(
      <NavDrivingList
        onValueChange={(value) => this.onValueChange(value)}
        values={this.getValue()}
        appConfig={this.getAppConfig()}
      />,
    );
  }
}

export default DrivingList;
