import { Form } from '@navikt/skjemadigitalisering-shared-domain';

export const mapToOption = (f: Form) => ({ value: f.path, label: `${f.skjemanummer} ${f.title}` });

export const formMatches = (searchTerm: string) => (form: Form) => {
  const searchStringLowerCase = searchTerm?.toLowerCase();
  const titleMatch = form.title?.toLowerCase().includes(searchStringLowerCase);
  const skjemanummerMatch = form.skjemanummer?.toLowerCase().includes(searchStringLowerCase);
  return titleMatch || skjemanummerMatch;
};
