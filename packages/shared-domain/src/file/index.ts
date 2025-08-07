interface UploadedFile {
  filId: string;
  vedleggId: string; // TODO kommer fra vedlegg komponenten (navId)
  innsendingId: string;
  filnavn: string;
  storrelse: number;
}

export type { UploadedFile };
