import { SendInnAktivitet, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavActivities from '../../../../components/activities/NavActivities';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import activitiesBuilder from './Activities.builder';
import activitiesForm from './Activities.form';

class Activities extends BaseComponent {
  lastRef: HTMLInputElement | null = null;
  isLoading = false;
  loadFinished = false;
  activities?: SendInnAktivitet[] = undefined;

  defaultActivity: SubmissionActivity = {
    aktivitetId: 'ingenAktivitet',
    text: this.translate(TEXTS.statiske.activities.defaultActivity),
  };

  static schema() {
    return BaseComponent.schema({
      label: 'Velg hvilken aktivitet du vil søke om stønad for',
      type: 'activities',
      key: 'aktivitet',
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
    const error = this.componentErrors[0];
    if (error) return error.message;
  }

  override checkValidity(): boolean {
    this.removeAllErrors();

    const submissionMethod = this.getAppConfig()?.submissionMethod;

    if (submissionMethod === 'digital') {
      const componentData = this.getValue() as SubmissionActivity;

      if (!componentData) {
        const requiredError = this.translate('required', {
          field: this.getLabel(),
        });
        super.addError(requiredError);
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
    super.handleChange(value, opts);
    this.rerender();
  }

  renderReact(element) {
    element.render(
      <>
        {this.getDiffTag()}
        <ComponentUtilsProvider component={this}>
          <NavActivities
            id={this.getId()}
            label={
              <Label
                component={this.component}
                translate={this.translate.bind(this)}
                options={this.options}
                builderMode={this.builderMode}
                editFields={this.editFields}
                labelOptions={{ showOptional: false }}
              />
            }
            value={this.getValue()}
            onChange={(value, options) => this.changeHandler(value, options)}
            description={<Description component={this.component} translate={this.translate.bind(this)} />}
            className={this.getClassName()}
            error={this.getError()}
            defaultActivity={this.defaultActivity}
            dataType="aktivitet"
            ref={(ref) => this.setReactInstance(ref)}
            shouldAutoSelectSingleActivity={false}
          />
        </ComponentUtilsProvider>
      </>,
    );
  }
}

export default Activities;
