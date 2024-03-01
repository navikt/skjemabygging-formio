import { SendInnAktivitet, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavActivities from '../../../../components/activities/NavActivities';
import BaseComponent from '../../base/BaseComponent';
import activitiesBuilder from './Activities.builder';
import activitiesForm from './Activities.form';

class Activities extends BaseComponent {
  lastRef: HTMLInputElement | null = null;
  isLoading = false;
  loadFinished = false;
  activities?: SendInnAktivitet[] = undefined;
  defaultActivity = {
    aktivitetId: 'ingenAktivitet',
    maalgruppe: '',
    periode: { fom: '', tom: '' },
    text: this.t(TEXTS.statiske.activities.defaultActivity),
  };

  static schema() {
    return BaseComponent.schema({
      label: TEXTS.statiske.activities.label,
      type: 'activities',
      key: 'aktivitet',
      input: true,
      hideLabel: true,
    });
  }

  static editForm() {
    return activitiesForm();
  }

  static get builderInfo() {
    return activitiesBuilder();
  }

  // The radio/checkbox values are simple strings, but the whole activity object is stored in the submission
  changeHandler(value?: SubmissionActivity, opts?: object) {
    if (!value) {
      super.resetValue();
    }
    super.updateValue(value, opts);
    this.rerender();
  }

  focus() {
    if (this.lastRef) {
      this.lastRef.focus();
    }
  }

  setLastRef(ref: any) {
    this.lastRef = ref;
  }

  renderReact(element) {
    element.render(
      <>
        <NavActivities
          id={this.getId()}
          label={this.getLabel()}
          value={this.getValue()}
          onChange={(value, options) => this.changeHandler(value, options)}
          description={this.getDescription()}
          className={this.getClassName()}
          error={this.getError()}
          appConfig={this.getAppConfig()}
          defaultActivity={this.defaultActivity}
          t={this.t.bind(this)}
          dataType="aktivitet"
          setLastRef={(ref) => this.setLastRef(ref)}
        />
      </>,
    );
  }
}

export default Activities;
