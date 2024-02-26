import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { validering } from '../../../../../../shared-domain/src/texts/validering';

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
