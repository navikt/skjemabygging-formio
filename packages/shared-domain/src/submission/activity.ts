import { SendInnMaalgruppe } from '../sendinn/activity';

export interface SubmissionActivity {
  aktivitetId: string;
  maalgruppe?: SendInnMaalgruppe;
  periode?: { fom: string; tom: string };
  text: string;
  vedtaksId?: string;
}
