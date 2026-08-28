import {
  AktivitetVedtaksinformasjon,
  DrivingListSubmission,
  SendInnAktivitet,
  SubmissionActivity,
  VedtakBetalingsplan,
  dateUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApplication } from '../../context/application/ApplicationContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useRuntimeServices } from '../../context/runtime-services/RuntimeServicesContext';
import { useStateField } from '../../context/state/useStateField';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import {
  allPaperFieldsForPeriodsAreSet,
  findSelectedVedtak,
  getAlreadyRefundedPeriods,
  getAvailablePeriods,
  getFuturePeriodEnd,
  mapVedtakActivities,
} from './drivingListUtils';

type DrivingListStatus = 'loading' | 'ready' | 'error';

interface DrivingListState {
  activities: SendInnAktivitet[];
  addPeriod: () => void;
  alreadyRefundedPeriods: VedtakBetalingsplan[];
  availablePeriods: VedtakBetalingsplan[];
  onActivityChange: (selectedVedtaksId: string) => void;
  onParkingChange: (nextValue: string) => void;
  removePeriod: () => void;
  selectedVedtak?: AktivitetVedtaksinformasjon;
  status: DrivingListStatus;
  value: DrivingListSubmission;
  vedtakOptions: SubmissionActivity[];
  nextFuturePeriodEnd?: string;
}

const normalizeSubmissionDate = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (dateUtils.isValid(value, 'submission')) {
    return value;
  }

  if (dateUtils.isValid(value, 'input')) {
    return dateUtils.toSubmissionDate(value);
  }

  return undefined;
};

const useDrivingListState = (statePath: string): DrivingListState => {
  const { logger } = useApplication();
  const { formData } = useRuntimeServices();
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage } = useLanguage();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const [status, setStatus] = useState<DrivingListStatus>('loading');
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const value = useMemo(
    () => ((stateValue as DrivingListSubmission | undefined) ?? { dates: [] }) as DrivingListSubmission,
    [stateValue],
  );
  const previousSelectedDateRef = useRef<string | undefined>(normalizeSubmissionDate(value.selectedDate));
  const vedtakOptions = useMemo(() => mapVedtakActivities(activities, currentLanguage), [activities, currentLanguage]);
  const { selectedVedtak } = findSelectedVedtak(activities, value.selectedVedtaksId);
  const availablePeriods = getAvailablePeriods(selectedVedtak);
  const alreadyRefundedPeriods = getAlreadyRefundedPeriods(selectedVedtak);
  const nextFuturePeriodEnd = getFuturePeriodEnd(selectedVedtak);

  useEffect(() => {
    if (submissionMethod !== 'digital') {
      return;
    }

    let cancelled = false;
    void formData
      .getActivities({ dailyTravel: true })
      .then((result) => {
        if (!cancelled) {
          setActivities(result);
          setStatus('ready');
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          logger?.error?.('Failed to load driving list activities', {
            statePath,
            error: fetchError instanceof Error ? fetchError.message : String(fetchError),
          });
          setActivities([]);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [formData, logger, statePath, submissionMethod]);

  useEffect(() => {
    if (submissionMethod === 'digital' && vedtakOptions.length === 1 && !value.selectedVedtaksId) {
      const [singleVedtak] = vedtakOptions;
      setStateValue({ ...value, selectedVedtaksId: singleVedtak.vedtaksId, tema: singleVedtak.tema });
    }
  }, [setStateValue, submissionMethod, value, vedtakOptions]);

  useEffect(() => {
    if (submissionMethod !== 'paper') {
      previousSelectedDateRef.current = normalizeSubmissionDate(value.selectedDate);
      return;
    }

    const selectedDate = normalizeSubmissionDate(value.selectedDate);
    const selectedDateChanged =
      !!selectedDate && !!previousSelectedDateRef.current && previousSelectedDateRef.current !== selectedDate;

    if (!selectedDate || !allPaperFieldsForPeriodsAreSet(selectedDate, value.parking)) {
      previousSelectedDateRef.current = selectedDate;
      return;
    }

    const periods = dateUtils.generateWeeklyPeriods(selectedDate, value.periods?.length ?? 1) ?? [];
    if (selectedDateChanged) {
      setStateValue({ ...value, selectedDate, periods, dates: [] });
    } else if (!value.periods?.length) {
      setStateValue({ ...value, selectedDate, periods });
    }

    previousSelectedDateRef.current = selectedDate;
  }, [setStateValue, submissionMethod, value]);

  const onParkingChange = (nextValue: string) => setStateValue({ ...value, parking: nextValue === 'true' });

  const onActivityChange = (selectedVedtaksId: string) => {
    const selected = vedtakOptions.find((option) => option.vedtaksId === selectedVedtaksId);
    setStateValue({ ...value, selectedVedtaksId, tema: selected?.tema, dates: [] });
  };

  const addPeriod = () => {
    const selectedDate = normalizeSubmissionDate(value.selectedDate);
    if (selectedDate) {
      setStateValue({
        ...value,
        periods: dateUtils.generateWeeklyPeriods(selectedDate, (value.periods?.length ?? 0) + 1),
      });
    }
  };

  const removePeriod = () => {
    const selectedDate = normalizeSubmissionDate(value.selectedDate);
    if (!selectedDate || !value.periods?.length) {
      return;
    }

    const periods = dateUtils.generateWeeklyPeriods(selectedDate, value.periods.length - 1);
    const dates = value.dates?.filter((item) => {
      const date = new Date(item.date);
      return periods.some((period) => date >= new Date(period.periodFrom) && date <= new Date(period.periodTo));
    });
    setStateValue({ ...value, periods, dates });
  };

  return {
    activities,
    addPeriod,
    alreadyRefundedPeriods,
    availablePeriods,
    nextFuturePeriodEnd,
    onActivityChange,
    onParkingChange,
    removePeriod,
    selectedVedtak,
    status,
    value,
    vedtakOptions,
  };
};

export { normalizeSubmissionDate, useDrivingListState };
export type { DrivingListState, DrivingListStatus };
