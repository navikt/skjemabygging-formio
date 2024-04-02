import { AktivitetPeriode, DrivingListSubmission, TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';

export type DrivingListMetadataId = (typeof metadata)[number]['id'];
export type DrivingListErrorType = 'required';
export interface ActivityAlertData {
  aktivitetsnavn: string;
  dagsats: number;
  periode: AktivitetPeriode;
  vedtaksId: string;
}

const metadata = [
  { id: 'activityRadio', label: TEXTS.statiske.activities.label },
  { id: 'parkingRadio', label: TEXTS.statiske.drivingList.parking },
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

export const isValidParking = (value: string) => {
  if (value === '') return true;
  return /^\d+$/.test(value);
};

export const allFieldsForPeriodsAreSet = (values?: DrivingListSubmission) => {
  return !!values?.selectedDate && values?.parking !== undefined && values?.parking !== null;
};

export const showAddButton = (values?: DrivingListSubmission) => {
  if (!values || !values.periods || values.periods.length === 0) return false;

  const lastPeriod = values.periods.reduce((prev, current) =>
    new Date(prev.periodTo) > new Date(current.periodTo) ? prev : current,
  );

  if (!lastPeriod) return false;

  const lastPeriodDate = new Date(lastPeriod.periodTo).setHours(0, 0, 0, 0);

  const today = new Date().setHours(0, 0, 0, 0);

  return lastPeriodDate < today;
};

export const showRemoveButton = (values?: DrivingListSubmission) => {
  return values?.periods?.length && values?.periods?.length > 1;
};

export const toDate = (values?: DrivingListSubmission) => {
  if (!values) return;

  const date = new Date();
  date.setDate(date.getDate() - 6);

  return date;
};
