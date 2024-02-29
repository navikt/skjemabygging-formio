import { Alert, Checkbox, CheckboxGroup, Radio, RadioGroup, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useState } from 'react';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import { AppConfigContextType } from '../../context/config/configContext';
import { mapActivity, mapActivityText } from '../../formio/components/core/activities/Activities.utils';

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
  setLastRef?: (ref: any) => void;
  t: any;
};

const NavActivities = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const [showError, setShowError] = useState<boolean>(false);

  const submissionMethod = props.appConfig?.submissionMethod;
  const isLoggedIn = props.appConfig?.config?.isLoggedIn;
  const app = props.appConfig?.app;

  // Will fetch activities if not provided in props
  useEffect(() => {
    const fetchData = async () => {
      if (app === 'fyllut' && isLoggedIn && submissionMethod === 'digital') {
        try {
          setLoading(true);
          const result = await getActivities(props.appConfig);
          setLoading(false);

          if (result) {
            setActivities(result);
          }
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

  const renderCheckbox = () => {
    return (
      <CheckboxGroup
        id={props.id}
        legend={props.label}
        value={props.value?.aktivitetId ? [props.value?.aktivitetId] : []}
        onChange={(values) => onChangeActivity(values[0] ?? props.defaultActivity)}
        description={props.description}
        className={props.className}
        error={props.error}
      >
        <Checkbox value={props.defaultActivity?.aktivitetId} ref={(ref) => props.setLastRef?.(ref)}>
          {props.defaultActivity?.text}
        </Checkbox>
      </CheckboxGroup>
    );
  };

  const onChangeActivity = (value: string) => {
    if (value === 'ingenAktivitet') {
      props.onChange(props.defaultActivity, { modified: true });
    } else {
      const activity = activities.find((x) => x.aktivitetId === value);
      if (activity) {
        props.onChange(mapActivity(activity), { modified: true });
      }
    }
  };

  const renderRadioGroup = () => {
    return (
      <RadioGroup
        id={props.id}
        legend={props.label}
        value={props.value?.aktivitetId ?? ''}
        onChange={(value) => onChangeActivity(value)}
        description={props.description}
        className={props.className}
        error={props.error}
      >
        {activities?.map((activity: SendInnAktivitet, index, arr) => {
          return (
            <Radio
              key={activity.aktivitetId}
              value={activity.aktivitetId}
              {...(index === arr.length - 1 && { ref: (ref) => props.setLastRef?.(ref) })}
            >
              {mapActivityText(activity)}
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

  const hasActivities = activities.length > 0;

  // Shows checkbox when there are no activities or it is displayed in byggeren
  // Shows radio when there are 1 or more activities
  const renderActivities = () => {
    if (hasActivities && loading) {
      return <Skeleton variant="rounded" width="100%" height={150} />;
    } else if (hasActivities && !loading) {
      return renderRadioGroup();
    } else if (props.defaultActivity && !loading) {
      return renderCheckbox();
    }
  };

  return (
    <>
      {renderActivities()}
      {showError && renderNoActivitiesAlert()}
    </>
  );
};

export default NavActivities;
