import { Activity } from '@navikt/skjemadigitalisering-shared-domain';

export type ActivityResponse = { id: string; tekst: string }[];

const mapActivityResponse = (response: ActivityResponse): Activity[] =>
  response.map(({ id, tekst }) => ({ value: id, label: tekst }));

export { mapActivityResponse };
