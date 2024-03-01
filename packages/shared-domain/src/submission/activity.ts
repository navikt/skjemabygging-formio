export interface SubmissionActivity {
  aktivitetId: string;
  maalgruppe: string;
  periode: { fom: string; tom: string };
  text: string;
  vedtaksId?: string;
}
