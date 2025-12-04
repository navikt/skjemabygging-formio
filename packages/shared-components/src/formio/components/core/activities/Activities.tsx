import { SendInnAktivitet, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NavActivities from '../../../../components/activities/NavActivities';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import BuilderTags from '../../base/components/BuilderTags';
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
      label: 'Hvilken aktivitet søker du om støtte i forbindelse med?',
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

  override getError(): string | undefined {
    const error = this.componentErrors[0];
    if (error) return error.message;
  }

  override checkValidity(): boolean {
    this.removeAllErrors();

    if (this.isSubmissionDigital()) {
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
      <ComponentUtilsProvider component={this}>
        <BuilderTags component={this.component} parent={this.parent} editFields={this.getEditFields()} />
        <NavActivities
          id={this.getId()}
          label={
            <Label
              component={this.component}
              parent={this.parent}
              editFields={this.getEditFields()}
              labelOptions={{ showOptional: false }}
            />
          }
          value={this.getValue()}
          onChange={(value, options) => this.changeHandler(value, options)}
          description={<Description component={this.component} />}
          className={this.getClassName()}
          error={this.getError()}
          defaultActivity={this.defaultActivity}
          dataType="aktivitet"
          ref={(ref) => this.setReactInstance(ref)}
          shouldAutoSelectSingleActivity={false}
        />
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default Activities;
