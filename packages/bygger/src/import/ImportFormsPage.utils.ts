import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

export const mapToOption = (f: NavFormType) => ({ value: f.path, label: `${f.properties.skjemanummer} ${f.title}` });

export const formMatches = (searchTerm: string) => (form: NavFormType) => {
  const searchStringLowerCase = searchTerm?.toLowerCase();
  const titleMatch = form.title?.toLowerCase().includes(searchStringLowerCase);
  const skjemanummerMatch = form.properties?.skjemanummer?.toLowerCase().includes(searchStringLowerCase);
  return titleMatch || skjemanummerMatch;
};
