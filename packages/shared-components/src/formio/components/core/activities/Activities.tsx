import { Alert, Checkbox, CheckboxGroup, Radio, RadioGroup, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { getActivities } from '../../../../api/sendinn/sendInnActivities';
import BaseComponent from '../../base/BaseComponent';
import activitiesBuilder from './Activities.builder';
import activitiesForm from './Activities.form';

class Activities extends BaseComponent {
  lastRef: HTMLInputElement | null = null;
  isLoading = false;
  loadFinished = false;
  activities?: SendInnAktivitet[] = undefined;
  activitiesError?: string;
  defaultActivity = {
    activity: { aktivitetId: 'ingenAktivitet', maalgruppe: '', periode: { fom: '', tom: '' } },
    text: this.t('Jeg får ikke opp noen aktiviteter her som stemmer med det jeg vil søke om'),
  };

  static schema() {
    return BaseComponent.schema({
      label: 'Velg hvilken aktivitet du vil søke om stønad for',
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
  changeHandler(value: string, opts: { modified: boolean }) {
    if (value === 'ingenAktivitet') {
      super.updateValue(this.defaultActivity.activity, opts);
    } else {
      const activity = this.activities?.find((x) => x.aktivitetId === value);
      if (activity) {
        super.updateValue(this.mapActivity(activity), opts);
      }
    }
    this.rerender();
  }

  focus() {
    if (this.lastRef) {
      this.lastRef.focus();
    }
  }

  getActivities() {
    const appConfig = this.getAppConfig();
    const isLoggedIn = this.getIsLoggedIn();

    if (!this.loadFinished && appConfig?.app === 'fyllut' && isLoggedIn === true) {
      this.isLoading = true;
      getActivities(appConfig)
        .then((data) => {
          this.activities = data;
        })
        .catch(() => {
          this.activities = undefined;
          this.activitiesError = this.t(
            'Kunne ikke hente aktiviteter. Du kan fortsatt gå videre uten å velge aktivitet.',
          );
        })
        .finally(() => {
          this.isLoading = false;
          this.loadFinished = true;
          this.rerender();
        });
    }
  }

  mapActivity(activity: SendInnAktivitet) {
    return {
      aktivitetId: activity.aktivitetId,
      maalgruppe: activity.maalgruppe,
      periode: activity.periode,
    };
  }

  renderReact(element) {
    this.getActivities();

    const renderCheckbox = () => {
      return (
        <CheckboxGroup
          id={this.getId()}
          legend={this.getLabel()}
          value={this.getValue()?.aktivitetId ?? ''}
          onChange={(values) => this.changeHandler(values[0], { modified: true })}
          ref={(ref) => this.setReactInstance(ref)}
          description={this.getDescription()}
          className={this.getClassName()}
          error={this.getError()}
        >
          <Checkbox value={this.defaultActivity.activity.aktivitetId} ref={(ref) => (this.lastRef = ref)}>
            {this.defaultActivity.text}
          </Checkbox>
        </CheckboxGroup>
      );
    };

    const renderRadioGroup = () => {
      return (
        <RadioGroup
          id={this.getId()}
          legend={this.getLabel()}
          value={this.getValue()?.aktivitetId ?? ''}
          onChange={(value) => this.changeHandler(value, { modified: true })}
          ref={(ref) => this.setReactInstance(ref)}
          description={this.getDescription()}
          className={this.getClassName()}
          error={this.getError()}
        >
          {this.activities?.map((activity: SendInnAktivitet, index, arr) => {
            return (
              <Radio
                key={activity.aktivitetId}
                value={activity.aktivitetId}
                {...(index === arr.length - 1 && { ref: (ref) => (this.lastRef = ref) })}
              >
                {`${activity.aktivitetsnavn}: ${dateUtils.toLocaleDate(
                  activity.periode.fom,
                )} - ${dateUtils.toLocaleDate(activity.periode.tom)}`}
              </Radio>
            );
          })}
          <Radio value={this.defaultActivity.activity.aktivitetId}>{this.defaultActivity.text}</Radio>
        </RadioGroup>
      );
    };

    const currentlyLoading = this.isLoading && !this.loadFinished;
    const hasActivities = this.activities && this.activities.length > 0;

    // Shows checkbox when there are no activities or it is displayed in byggeren
    // Shows radio when there are 1 or more activities
    const renderActivities = () => {
      if (!this.activities && currentlyLoading) {
        return <Skeleton variant="rounded" width="100%" height={150} />;
      } else if (hasActivities && !currentlyLoading) {
        return renderRadioGroup();
      } else {
        return renderCheckbox();
      }
    };

    element.render(
      <>
        {renderActivities()}
        {this.activitiesError && <Alert variant="info">{this.activitiesError}</Alert>}
      </>,
    );
  }
}

export default Activities;
