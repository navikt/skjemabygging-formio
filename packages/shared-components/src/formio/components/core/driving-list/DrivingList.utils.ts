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

export type ComponentId = (typeof componentsInfo)[number]['id'];

export const componentsInfo = [
  { id: 'activityRadio', label: 'Velg hvilken aktivitet du vil søke om stønad for' },
  { id: 'parkingRadio', label: 'Skal du registrere parkering?' },
  { id: 'periodType', label: 'Velg periode for innsending' },
  { id: 'datePicker', label: 'Velg første dato' },
  { id: 'dates', label: 'Kryss av for de dagene du har brukt egen bil og har hatt parkeringsutgifter' },
  { id: 'parkingExpenses', label: 'Parkeringsutgifter (kr)' },
] as const;

export const getComponentInfo = (componentId: ComponentId) => {
  const componentInfo = componentsInfo.find((component) => component.id === componentId);
  if (!componentInfo) throw Error(`Component with id ${componentId} not found`);
  return componentInfo;
};

export const requiredError = (componentId: ComponentId, t: (key: string, params?: any) => string) => {
  return t(validering.required, { field: t(getComponentInfo(componentId).label) });
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
