import { DrivingListPeriod, DrivingListSubmission, TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export type DrivingListMetadataId = (typeof metadata)[number]['id'];
export type DrivingListErrorType = 'required';

const metadata = [
  { id: 'activityRadio', label: TEXTS.statiske.activities.label },
  { id: 'parkingRadio', label: TEXTS.statiske.drivingList.parking },
  { id: 'periodType', label: TEXTS.statiske.drivingList.periodType },
  {
    id: 'datePicker',
    label: TEXTS.statiske.drivingList.datePicker,
    description: TEXTS.statiske.drivingList.datePickerDescription,
  },
  { id: 'dates', label: TEXTS.statiske.drivingList.dateSelect },
  { id: 'parkingExpenses', label: TEXTS.statiske.drivingList.parkingExpenses },
] as const;

export const drivingListMetadata = (
  metadataId: DrivingListMetadataId,
): { id: DrivingListMetadataId; label: string; description?: string } => {
  const metadataInfo = metadata.find((data) => data.id === metadataId);
  if (!metadataInfo) throw Error(`Metadata with id ${metadataId} not found`);
  return metadataInfo;
};

export const requiredError = (componentId: DrivingListMetadataId, t: TFunction): string => {
  const field = t(drivingListMetadata(componentId).label);
  return t('required', { field });
};

export const toLocaleDateLongMonth = (date: Date, locale?: string) => {
  if (!date) return '';
  return dateUtils.toLocaleDateLongMonth(date.toString(), locale);
};

export const toLocaleDate = (date: Date) => {
  if (!date) return '';
  return dateUtils.toLocaleDate(date.toString());
};

export const toWeekdayAndDate = (date: Date, locale?: string) => {
  if (!date) return '';
  return dateUtils.toWeekdayAndDate(date.toString(), locale);
};

export const generatePeriods = (
  periodType: 'weekly' | 'monthly',
  date?: string,
  numberOfPeriods: number = 1,
): DrivingListPeriod[] => {
  if (!date) return [];

  const periods: DrivingListPeriod[] = [];
  const today = DateTime.now();

  for (let i = 0; i < numberOfPeriods; i++) {
    let startDate = DateTime.fromISO(date);
    let endDate = DateTime.fromISO(date);

    if (periodType === 'weekly') {
      startDate = startDate.plus({ weeks: i });
      endDate = endDate.plus({ weeks: i + 1 }).minus({ days: 1 });
    } else if (periodType === 'monthly') {
      startDate = startDate.plus({ months: i });
      endDate = endDate.plus({ months: i + 1 }).minus({ days: 1 });
    }

    if (endDate > today) {
      endDate = today;
    }

    periods.push({ periodFrom: startDate.toJSDate(), periodTo: endDate.toJSDate(), id: uuidv4() });
  }

  return periods;
};

export const isValidParking = (value: string) => {
  if (value === '') return true;
  return /^\d+$/.test(value);
};

export const allFieldsForPeriodsAreSet = (values?: DrivingListSubmission) => {
  return (
    !!values?.selectedPeriodType &&
    !!values?.selectedDate &&
    !!values?.periods?.length &&
    values?.parking !== undefined &&
    values?.parking !== null
  );
};

export const showAddButton = (values?: DrivingListSubmission) => {
  if (!values) return false;

  const lastPeriod = values?.periods?.reduce((prev, current) =>
    DateTime.fromJSDate(prev.periodTo) > DateTime.fromJSDate(current.periodTo) ? prev : current,
  );
  if (!lastPeriod) return false;

  const lastPeriodDate = DateTime.fromJSDate(lastPeriod.periodTo).startOf('day');
  const today = DateTime.local().startOf('day');

  return lastPeriodDate < today;
};

export const showRemoveButton = (values?: DrivingListSubmission) => {
  return values?.periods?.length && values?.periods?.length > 1;
};

export const toDate = (values?: DrivingListSubmission) => {
  if (!values) return;

  let date = DateTime.now();

  if (values.selectedPeriodType === 'weekly') {
    date = date.minus({ week: 1 }).plus({ days: 1 });
  } else if (values.selectedPeriodType === 'monthly') {
    date = date.minus({ months: 1 }).plus({ days: 1 });
  }

  return date.toJSDate();
};
