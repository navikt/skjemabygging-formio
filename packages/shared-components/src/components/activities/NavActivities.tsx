import { Alert, Checkbox, CheckboxGroup, Radio, RadioGroup, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { ReactNode, forwardRef, useEffect, useState } from 'react';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import { AppConfigContextType } from '../../context/config/configContext';
import { mapToSubmissionActivity } from '../../formio/components/core/activities/Activities.utils';

type Props = {
  id: string;
  label?: ReactNode;
  value?: SubmissionActivity;
  onChange: (value?: SubmissionActivity, options?: object) => void;
  description?: ReactNode;
  className?: string;
  error?: string;
  defaultActivity?: SubmissionActivity;
  appConfig: AppConfigContextType;
  t: TFunction;
  dataType: ActivityDataType;
  activities?: SendInnAktivitet[];
  locale: string;
};

type ActivityDataType = 'aktivitet' | 'vedtak';

// Renders a activity-data from Arena
// In some cases it's more relevant to list all 'vedtak' that are part of the activities instead
const NavActivities = forwardRef<HTMLFieldSetElement, Props>((props: Props, ref) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activitySelections, setActivitySelections] = useState<SubmissionActivity[]>([]);
  const [showError, setShowError] = useState<boolean>(false);

  const submissionMethod = props.appConfig?.submissionMethod;
  const isLoggedIn = props.appConfig?.config?.isLoggedIn;
  const app = props.appConfig?.app;

  useEffect(() => {
    const fetchData = async () => {
      if (app === 'fyllut' && isLoggedIn && submissionMethod === 'digital' && !props.activities) {
        try {
          setLoading(true);
          let result: SendInnAktivitet[] | undefined = [];
          if (props.dataType === 'vedtak') {
            result = await getActivities(props.appConfig, true);
          } else {
            result = await getActivities(props.appConfig, false);
          }

          if (result) {
            setActivitySelections(mapToSubmissionActivity(result, props.dataType, props.locale));
          }
          setLoading(false);
        } catch (ex) {
          setLoading(false);
          setShowError(true);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (props.activities) {
      setActivitySelections(mapToSubmissionActivity(props.activities, props.dataType, props.locale));
    }
  }, [props.activities, props.dataType]);

  const getId = (activity: SubmissionActivity) => {
    return activity.vedtaksId ?? activity.aktivitetId;
  };

  const renderCheckbox = () => {
    return (
      <CheckboxGroup
        id={props.id}
        legend={props.label}
        value={props.value?.aktivitetId ? [props.value?.aktivitetId] : []}
        onChange={(values) => onChangeActivity(values[0])}
        description={props.description}
        className={props.className}
        error={props.error}
        tabIndex={-1}
        ref={ref}
      >
        <Checkbox value={props.defaultActivity?.aktivitetId}>{props.defaultActivity?.text}</Checkbox>
      </CheckboxGroup>
    );
  };

  const onChangeActivity = (value?: string) => {
    if (!value) {
      props.onChange(undefined, { modified: true });
    } else if (value === 'ingenAktivitet') {
      props.onChange(props.defaultActivity, { modified: true });
    } else {
      const vedtakActivity = activitySelections.find((x) => x.vedtaksId === value);
      const activity = activitySelections.find((x) => x.aktivitetId === value);

      if (vedtakActivity) {
        props.onChange(vedtakActivity, { modified: true });
      } else if (activity) {
        props.onChange(activity, { modified: true });
      }
    }
  };

  const renderRadioGroup = () => {
    return (
      <RadioGroup
        id={props.id}
        legend={props.label}
        value={props.value?.vedtaksId ?? props.value?.aktivitetId ?? ''}
        onChange={(value) => onChangeActivity(value)}
        description={props.description}
        className={props.className}
        error={props.error}
        tabIndex={-1}
        ref={ref}
      >
        {activitySelections?.map((activity: SubmissionActivity) => {
          return (
            <Radio key={getId(activity)} value={getId(activity)}>
              {activity.text}
            </Radio>
          );
        })}
        {props.defaultActivity && (
          <Radio value={props.defaultActivity?.aktivitetId}>{props.defaultActivity?.text}</Radio>
        )}
      </RadioGroup>
    );
  };

  const renderNoActivitiesAlert = () => {
    return <Alert variant="info">{`${props.t(TEXTS.statiske.activities.errorContinue)}`}</Alert>;
  };

  const hasActivities = activitySelections.length > 0;

  // Shows checkbox when there are no activities or it is displayed in byggeren
  // Shows radio when there are 1 or more activities
  const renderActivities = () => {
    if (loading) {
      return <Skeleton variant="rounded" width="100%" height={150} />;
    } else if (hasActivities && !loading) {
      return renderRadioGroup();
    } else if (props.defaultActivity && !loading) {
      return renderCheckbox();
    }
  };

  return (
    <>
      {submissionMethod === 'digital' && (
        <>
          {renderActivities()}
          {showError && renderNoActivitiesAlert()}
        </>
      )}
    </>
  );
});

export default NavActivities;
