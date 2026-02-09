import { Alert, Checkbox, CheckboxGroup, Radio, RadioGroup, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, forwardRef, useEffect, useMemo, useState } from 'react';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
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
  dataType: ActivityDataType;
  activities?: SendInnAktivitet[];
  shouldAutoSelectSingleActivity?: boolean;
};

type ActivityDataType = 'aktivitet' | 'vedtak';

// Renders a activity-data from Arena
// In some cases it's more relevant to list all 'vedtak' that are part of the activities instead
const NavActivities = forwardRef<HTMLFieldSetElement, Props>((props: Props, ref) => {
  const [loading, setLoading] = useState<boolean>(!props.activities);
  const [activitySelections, setActivitySelections] = useState<SubmissionActivity[]>([]);
  const [showError, setShowError] = useState<boolean>(false);
  const { translate, locale, appConfig } = useComponentUtils();

  const submissionMethod = appConfig?.submissionMethod;
  const isLoggedIn = appConfig?.config?.isLoggedIn;
  const app = appConfig?.app;

  const autoSelectSingleActivity = (submissionActivities: SubmissionActivity[]) => {
    if (submissionActivities.length === 1 && props.shouldAutoSelectSingleActivity) {
      props.onChange(submissionActivities[0], { modified: true, autoSelect: true });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (app === 'fyllut' && isLoggedIn && submissionMethod === 'digital' && !props.activities) {
        try {
          setLoading(true);
          let result: SendInnAktivitet[] | undefined = [];
          if (props.dataType === 'vedtak') {
            result = await getActivities(appConfig, true);
          } else {
            result = await getActivities(appConfig, false);
          }

          if (result) {
            const submissionActivities = mapToSubmissionActivity(result, props.dataType, locale);
            autoSelectSingleActivity(submissionActivities);
            setActivitySelections(submissionActivities);
          }
          setLoading(false);
        } catch (_ex) {
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
      const submissionActivities = mapToSubmissionActivity(props.activities, props.dataType, locale);
      autoSelectSingleActivity(submissionActivities);
    }
  }, [props.activities, props.dataType]);

  const derivedActivities = useMemo(
    () => (props.activities ? mapToSubmissionActivity(props.activities, props.dataType, locale) : activitySelections),
    [activitySelections, locale, props.activities, props.dataType],
  );

  const derivedLoading = props.activities ? false : loading;

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
      const vedtakActivity = derivedActivities.find((x) => x.vedtaksId === value);
      const activity = derivedActivities.find((x) => x.aktivitetId === value);

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
        {derivedActivities?.map((activity: SubmissionActivity) => {
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
    return <Alert variant="info">{`${translate(TEXTS.statiske.activities.errorContinue)}`}</Alert>;
  };

  // For the driving list if there is only one activity, it it selected by default and not shown (the default activity is not shown either)
  // Show radio buttons if there are multiple activities (including the default activity)
  // Show checkbox if there are no activities (default activity is shown)
  const renderActivities = () => {
    if (derivedLoading) {
      return <Skeleton variant="rounded" width="100%" height={150} />;
    } else if (derivedActivities.length === 1 && props.shouldAutoSelectSingleActivity) {
      return <></>;
    } else if (derivedActivities.length > 0) {
      return renderRadioGroup();
    } else if (props.defaultActivity) {
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
