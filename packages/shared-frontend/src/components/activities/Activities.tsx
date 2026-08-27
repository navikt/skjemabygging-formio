import {
  ComponentValue,
  SendInnAktivitet,
  SubmissionActivity,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useStateField } from '../../context/state/useStateField';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import Alert from '../alert/Alert';
import CheckboxGroup from '../checkbox-group/CheckboxGroup';
import RadioGroup from '../radio-group/RadioGroup';
import ReadMore from '../read-more/ReadMore';
import { BaseFieldProps } from '../types';
import { getSelectedActivityId, mapActivities } from './activitiesUtils';

type ActivitiesProps = Pick<BaseFieldProps, 'statePath' | 'label' | 'description' | 'readMore'>;
type ActivitiesStatus = 'loading' | 'ready' | 'error';

const Activities = ({ statePath, label, description, readMore }: ActivitiesProps) => {
  const { logger } = useApplication();
  const { formData } = useRuntimeServices();
  const { submissionMethod } = useSubmissionMethod();
  const { translate, currentLanguage } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const [status, setStatus] = useState<ActivitiesStatus>('loading');
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const activitySelections = useMemo(() => mapActivities(activities, currentLanguage), [activities, currentLanguage]);
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

    void formData
      .getActivities()
      .then((result) => {
        if (cancelled) {
          return;
        }

        setActivities(result);
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
        setActivities([]);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [formData, logger, statePath, submissionMethod]);

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
