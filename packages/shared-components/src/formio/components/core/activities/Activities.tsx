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

  defaultActivity: SubmissionActivity = {
    aktivitetId: 'ingenAktivitet',
    text: this.t(TEXTS.statiske.activities.defaultActivity),
  };

  static schema() {
    return BaseComponent.schema({
      label: 'Velg hvilken aktivitet du vil søke om stønad for',
      type: 'activities',
      key: 'aktivitet',
      input: true,
    });
  }

  static editForm() {
    return activitiesForm();
  }

  static get builderInfo() {
    return activitiesBuilder();
  }

  override get errors() {
    return this.componentErrors;
  }

  override getError(): string | undefined {
    const error = this.componentErrors.find((error) => error.path === this.getId());
    if (error) return error.message;
  }

  override checkValidity(): boolean {
    this.removeAllErrors();

    const submissionMethod = this.getAppConfig()?.submissionMethod;

    if (submissionMethod === 'digital') {
      const componentData = this.getValue() as SubmissionActivity;

      if (!componentData) {
        const requiredError = this.t('required', { field: this.getLabelText() });
        super.addError(this.getId(), requiredError);
      }
    }

    this.rerender();

    if (this.componentErrors.length > 0) {
      return false;
    }

    return true;
  }

  // The radio/checkbox values are simple strings, but the whole activity object is stored in the submission
  changeHandler(value?: SubmissionActivity, opts?: object) {
    if (!value) {
      super.resetValue();
    }
    super.updateValue(value, opts);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <>
        {this.getDiffTag()}
        <NavActivities
          id={this.getId()}
          label={this.getLabelText()}
          value={this.getValue()}
          onChange={(value, options) => this.changeHandler(value, options)}
          description={this.getDescription()}
          className={this.getClassName()}
          error={this.getError()}
          appConfig={this.getAppConfig()}
          defaultActivity={this.defaultActivity}
          t={this.t.bind(this)}
          dataType="aktivitet"
        />
      </>,
    );
  }
}

export default Activities;
