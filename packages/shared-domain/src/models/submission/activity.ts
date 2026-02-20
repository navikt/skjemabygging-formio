import { SendInnMaalgruppe } from '../sendinn';

interface SubmissionActivity {
  aktivitetId: string;
  maalgruppe?: SendInnMaalgruppe;
  periode?: { fom: string; tom: string };
  text: string;
  vedtaksId?: string;
  tema?: string;
}

export type { SubmissionActivity };
