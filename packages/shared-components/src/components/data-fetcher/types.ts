import { Activity } from '@navikt/skjemadigitalisering-shared-domain';

export type DataFetcherData = {
  data?: Activity[];
  fetchError?: boolean;
  fetchDisabled?: boolean;
};
