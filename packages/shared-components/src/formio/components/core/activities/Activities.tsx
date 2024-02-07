import { Checkbox, CheckboxGroup, Radio, RadioGroup, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import Field from 'formiojs/components/_classes/field/Field';
import { getActivities } from '../../../../api/sendinn/sendInnActivities';
import BaseComponent from '../../base/BaseComponent';
import activitiesBuilder from './Activities.builder';
import activitiesForm from './Activities.form';

class Activities extends BaseComponent {
  lastRef: HTMLInputElement | null = null;
  isLoading = false;
  loadFinished = false;
  activities?: SendInnAktivitet[] = undefined;
  defaultActivity = {
    value: '0',
    text: this.t('Jeg får ikke opp noen aktiviteter her som stemmer med det jeg vil søke om'),
  };

  static schema() {
    return Field.schema({
      label: 'Aktiviteter',
      type: 'activities',
      key: 'activities',
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

  changeHandler(value: string, opts: { modified: boolean }) {
    super.updateValue(value, opts);
    this.rerender();
  }

  focus() {
    if (this.lastRef) {
      this.lastRef.focus();
    }
  }

  renderReact(element) {
    const appConfig = this.getAppConfig();
    const legend = this.t('Velg hvilken aktivitet du vil søke om stønad for');
    const description = this.t(
      'Her viser vi deg de aktivitetene vi har registrert at du deltar på. Vi viser ikke aktiviteter som er avsluttet for mer enn seks måneder siden, eller som vil starte opp mer enn to måneder frem i tid.',
    );

    if (!this.loadFinished && appConfig?.app === 'fyllut') {
      this.isLoading = true;
      getActivities(appConfig)
        .then((data) => {
          this.activities = data;
        })
        .catch((err) => {
          console.warn(`Unable to load activities for ${this.getId()})`);

          // FIXME: How does this work? And handle different errors
          this.emit('componentError', {
            component: this.component,
            message: err.toString(),
          });
        })
        .finally(() => {
          this.isLoading = false;
          this.loadFinished = true;
          this.rerender();
        });
    }

    // Shows checkbox when there is 1 element
    // Shows radio when there are more than 1 element
    element.render(
      <>
        {this.getDiffTag()}
        {!this.activities && this.isLoading && <Skeleton variant="rectangle" width="100%" height={100} />}
        {!this.activities && !this.isLoading ? (
          <CheckboxGroup
            id={this.getId()}
            ref={(ref) => this.setReactInstance(ref)}
            legend={legend}
            onChange={(values: string[]) => this.changeHandler(values[0], { modified: true })}
            description={description}
            defaultValue={this.getValue()}
            error={this.getError()}
            className={this.getClassName()}
          >
            <Checkbox value={this.defaultActivity.value} ref={(ref) => (this.lastRef = ref)}>
              {this.defaultActivity.text}
            </Checkbox>
          </CheckboxGroup>
        ) : (
          <RadioGroup
            id={this.getId()}
            ref={(ref) => this.setReactInstance(ref)}
            legend={legend}
            onChange={(value: string) => this.changeHandler(value, { modified: true })}
            description={description}
            defaultValue={this.getValue()}
            error={this.getError()}
            className={this.getClassName()}
          >
            {this.activities?.map((activity: SendInnAktivitet, index, arr) => {
              return (
                <Radio
                  key={activity.aktivitetId}
                  value={activity.aktivitetId}
                  {...(index === arr.length - 1 && { ref: (ref) => (this.lastRef = ref) })}
                >
                  {`${activity.aktivitetsnavn}: ${activity.periode.fom}-${activity.periode.fom}`}
                </Radio>
              );
            })}
            <Radio value={this.defaultActivity.value}>{this.defaultActivity.text}</Radio>
          </RadioGroup>
        )}
      </>,
    );
  }
}

export default Activities;
