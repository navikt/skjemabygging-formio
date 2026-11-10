import {
  ComponentValue,
  SendInnAktivitet,
  SubmissionActivity,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import Alert from '../../../components/alert/Alert';
import CheckboxGroup from '../../../components/checkbox-group/CheckboxGroup';
import RadioGroup from '../../../components/radio-group/RadioGroup';
import ReadMore from '../../../components/read-more/ReadMore';
import { useApplication } from '../../../context/application/ApplicationContext';
import { useFormDefinitionSubmissionMethod } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import { useFieldBinding } from '../../../context/state/useFieldBinding';
import { ActivitiesDefinition } from '../../component-types';
import { InputComponentProps, resolveReadMore, resolveSubmissionPath } from '../../inputComponentUtils';
import { getSelectedActivityId, mapActivities } from './activitiesUtils';

type ActivitiesStatus = 'loading' | 'ready' | 'error';

const InputActivities = ({ component, submissionPath }: InputComponentProps<ActivitiesDefinition>) => {
  const { logger } = useApplication();
  const { formData } = useRuntimeServices();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { translate, currentLanguage } = useLanguage();
  const statePath = resolveSubmissionPath(component, submissionPath);
  const readMore = resolveReadMore(component);
  const [status, setStatus] = useState<ActivitiesStatus>('loading');
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const { stateValue, error, setStateValue } = useFieldBinding({ statePath });

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

  if (submissionMethod !== 'digital' || status === 'loading') {
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

  return (
    <>
      {activitySelections.length > 0 ? (
        <RadioGroup
          statePath={statePath}
          legend={component.label ?? TEXTS.statiske.activities.label}
          description={component.description}
          values={activityOptions}
          value={selectedActivityId}
          onChange={onChangeActivity}
          error={error}
          required
        />
      ) : (
        <CheckboxGroup
          statePath={statePath}
          legend={component.label ?? TEXTS.statiske.activities.label}
          description={component.description}
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

export default InputActivities;
