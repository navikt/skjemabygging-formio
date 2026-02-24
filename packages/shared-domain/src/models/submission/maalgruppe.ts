import { SendInnMaalgruppe } from '../sendinn';

interface SubmissionMaalgruppe {
  calculated?: SendInnMaalgruppe;
  prefilled?: SendInnMaalgruppe;
}

export type { SendInnMaalgruppe, SubmissionMaalgruppe };
