import { Activity } from '@navikt/skjemadigitalisering-shared-domain';

export type ActivityResponse = { id: string; tekst: string; type: string }[];

const mapActivityResponse = (response: ActivityResponse): Activity[] =>
  response.map(({ id, tekst, type }) => ({ value: id, label: tekst, type }));

export { mapActivityResponse };
