import { ComponentValue, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import Alert from '../alert/Alert';
import CheckboxGroup from '../checkbox-group/CheckboxGroup';
import RadioGroup from '../radio-group/RadioGroup';
import ReadMore from '../read-more/ReadMore';
import { BaseFieldProps } from '../types';
import { fetchActivities, getSelectedActivityId, mapActivities } from './activitiesUtils';

type ActivitiesProps = Pick<BaseFieldProps, 'statePath' | 'label' | 'description' | 'readMore'>;
type ActivitiesStatus = 'loading' | 'ready' | 'error';

const Activities = ({ statePath, label, description, readMore }: ActivitiesProps) => {
  const { submissionMethod, logger } = useAppConfig();
  const { translate, currentLanguage } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const [status, setStatus] = useState<ActivitiesStatus>('loading');
  const [activitySelections, setActivitySelections] = useState<SubmissionActivity[]>([]);
  const currentValue = stateValue as SubmissionActivity | undefined;
  const defaultActivity = useMemo<SubmissionActivity>(
    () => ({
      aktivitetId: 'ingenAktivitet',
      text: translate(TEXTS.statiske.activities.defaultActivity),
    }),
    [translate],
  );
  const activityOptions = useMemo<ComponentValue[]>(
    () => [
      ...activitySelections.map((activity) => ({
        value: activity.aktivitetId,
        label: activity.text,
      })),
      {
        value: defaultActivity.aktivitetId,
        label: defaultActivity.text,
      },
    ],
    [activitySelections, defaultActivity],
  );
  const defaultActivityOption = useMemo<ComponentValue[]>(
    () => [
      {
        value: defaultActivity.aktivitetId,
        label: defaultActivity.text,
      },
    ],
    [defaultActivity],
  );

  useEffect(() => {
    if (submissionMethod !== 'digital') {
      return;
    }

    let cancelled = false;

    void fetchActivities()
      .then((activities) => {
        if (cancelled) {
          return;
        }

        setActivitySelections(mapActivities(activities, currentLanguage));
        setStatus('ready');
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }

        logger?.error?.('Failed to load activities', {
          statePath,
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        });
        setActivitySelections([]);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [currentLanguage, logger, statePath, submissionMethod]);

  if (submissionMethod !== 'digital') {
    return null;
  }

  const selectedActivityId = getSelectedActivityId(currentValue);

  const onChangeActivity = (value?: string) => {
    if (!value) {
      setStateValue(undefined);
      return;
    }

    if (value === defaultActivity.aktivitetId) {
      setStateValue(defaultActivity);
      return;
    }

    setStateValue(activitySelections.find((activity) => activity.aktivitetId === value));
  };

  if (status === 'loading') {
    return null;
  }

  return (
    <>
      {activitySelections.length > 0 ? (
        <RadioGroup
          statePath={statePath}
          legend={label ?? TEXTS.statiske.activities.label}
          description={description}
          values={activityOptions}
          value={selectedActivityId}
          onChange={onChangeActivity}
          error={error}
          required
        />
      ) : (
        <CheckboxGroup
          statePath={statePath}
          legend={label ?? TEXTS.statiske.activities.label}
          description={description}
          values={defaultActivityOption}
          value={selectedActivityId ? [selectedActivityId] : []}
          onChange={(values) => onChangeActivity(values[0])}
          error={error}
          required
        />
      )}
      {status === 'error' && <Alert variant="info">{translate(TEXTS.statiske.activities.errorContinue)}</Alert>}
      {readMore && <ReadMore {...readMore} />}
    </>
  );
};

export default Activities;
export type { ActivitiesProps };
