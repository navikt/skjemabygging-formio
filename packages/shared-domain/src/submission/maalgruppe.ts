import { SendInnMaalgruppe } from '../sendinn/activity';

export interface SubmissionMaalgruppe {
  calculated?: SendInnMaalgruppe;
  prefilled?: SendInnMaalgruppe;
}
