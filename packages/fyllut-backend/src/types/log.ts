export interface LogMetadata {
  skjemanummer?: string;
  submissionMethod?: string;
  innsendingsId?: string;
  fyllutRequestPath?: string;
  [key: string]: string | number | boolean | undefined;
}
