import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { v4 as uuidv4 } from 'uuid';
import { validering } from '../../../../../../shared-domain/src/texts/validering';

export interface DrivingListPeriod {
  periodFrom: Date;
  periodTo: Date;
  id: string;
}

export interface DrivingListSubmission {
  selectedDate: string;
  selectedPeriodType?: 'weekly' | 'monthly';
  periods?: DrivingListPeriod[];
  parking?: boolean;
  dates: { date: string; parking: string }[];
  selectedActivity?: string;
}

export type DrivingListMetadataId = (typeof metadata)[number]['id'];
export type DrivingListErrorType = 'required';

const metadata = [
  { id: 'activityRadio', label: 'Velg hvilken aktivitet du vil søke om stønad for' },
  { id: 'parkingRadio', label: 'Skal du registrere parkering?' },
  { id: 'periodType', label: 'Velg periode for innsending' },
  { id: 'datePicker', label: 'Velg første dato' },
  { id: 'dates', label: 'Kryss av for de dagene du har brukt egen bil og har hatt parkeringsutgifter' },
  { id: 'parkingExpenses', label: 'Parkeringsutgifter (kr)' },
] as const;

export const drivingListMetadata = (metadataId: DrivingListMetadataId) => {
  const metadataInfo = metadata.find((data) => data.id === metadataId);
  if (!metadataInfo) throw Error(`Metadata with id ${metadataId} not found`);
  return metadataInfo;
};

export const requiredError = (componentId: DrivingListMetadataId, t: (key: string, params?: any) => string) => {
  return t(validering.required, { field: t(drivingListMetadata(componentId).label) });
};

export const toLocaleDate = (date: Date) => {
  return dateUtils.toLocaleDate(date.toString());
};

export const toWeekdayAndDate = (date: Date) => {
  return dateUtils.toWeekdayAndDate(date.toString());
};

export const generatePeriods = (periodType: 'weekly' | 'monthly', date?: string): DrivingListPeriod[] => {
  if (!date) return [];

  const startDate = new Date(date);
  const endDate = new Date(date);

  if (periodType === 'weekly') {
    endDate.setDate(endDate.getDate() + 6);
  } else if (periodType === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  return [{ periodFrom: startDate, periodTo: endDate, id: uuidv4() }];
};

export const isValidParking = (value: string) => {
  if (value === '') return true;
  return /^\d+$/.test(value);
};
