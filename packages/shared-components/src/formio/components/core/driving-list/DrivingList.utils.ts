import { DrivingListPeriod, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { v4 as uuidv4 } from 'uuid';
import { validering } from '../../../../../../shared-domain/src/texts/validering';

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

export const requiredError = (componentId: DrivingListMetadataId, t: TFunction): string => {
  return t(validering.required, { field: t(drivingListMetadata(componentId).label) });
};

export const toLocaleDate = (date: Date) => {
  return dateUtils.toLocaleDate(date.toString());
};

export const toWeekdayAndDate = (date: Date) => {
  return dateUtils.toWeekdayAndDate(date.toString());
};

export const generatePeriods = (
  periodType: 'weekly' | 'monthly',
  date?: string,
  numberOfPeriods: number = 1,
): DrivingListPeriod[] => {
  if (!date) return [];

  const periods: DrivingListPeriod[] = [];

  for (let i = 0; i < numberOfPeriods; i++) {
    const startDate = new Date(date);
    const endDate = new Date(date);

    if (periodType === 'weekly') {
      startDate.setDate(startDate.getDate() + i + 6 * i);
      endDate.setDate(endDate.getDate() + i + 6 * (i + 1));
    } else if (periodType === 'monthly') {
      startDate.setMonth(startDate.getMonth() + 1 * i);
      endDate.setMonth(endDate.getMonth() + 1 * (i + 1));
      endDate.setDate(endDate.getDate() - 1);
    }
    periods.push({ periodFrom: startDate, periodTo: endDate, id: uuidv4() });
  }

  return periods;
};

export const isValidParking = (value: string) => {
  if (value === '') return true;
  return /^\d+$/.test(value);
};
