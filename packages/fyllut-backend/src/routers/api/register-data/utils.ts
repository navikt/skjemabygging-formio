import { Activity } from '@navikt/skjemadigitalisering-shared-domain';

export type ActivityResponse = { alternativ: Array<{ id: string; tekst: string }> };

const mapActivityResponse = ({ alternativ }: ActivityResponse): Activity[] =>
  alternativ.map(({ id, tekst }) => ({ value: id, label: tekst }));

export { mapActivityResponse };
