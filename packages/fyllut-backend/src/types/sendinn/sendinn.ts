export type BrukerDto = { id: string; idType: 'FNR' };
export type AvsenderId = { navn?: string; id?: string; idType?: 'FNR' };

export interface SendInnSoknadBodyV2 {
  brukerDto?: BrukerDto;
  avsenderId?: AvsenderId;
  innsendingsId?: string | null;
  skjemanr: string;
  tittel: string;
  tema: string;
  spraak: string;
  hoveddokument: DokumentV2;
  hoveddokumentVariant: DokumentV2;
  fristForEttersendelse?: number;
  vedleggsListe?: DokumentV2[] | null;
  kanLasteOppAnnet?: boolean | null;
  mellomlagringDager?: number;
  visningsType?: VisningsType | null;
}

export interface DokumentV2 {
  vedleggsnr: string;
  label: string;
  tittel: string;
  opplastingsStatus: OpplastingsStatus;
  mimetype: 'application/json' | 'application/pdf';
  pakrevd: boolean;
  document?: string | null;
  filIdListe?: string[] | null;
  fyllutId: string | null;
  beskrivelse: string | null;
  propertyNavn: string | null;
  vedleggsurl?: string;
}

export type OpplastingsStatus =
  | 'IkkeValgt'
  | 'LastetOpp'
  | 'Innsendt'
  | 'SendSenere'
  | 'SendesAvAndre'
  | 'SendesIkke'
  | 'LastetOppIkkeRelevantLenger'
  | 'LevertDokumentasjonTidligere'
  | 'HarIkkeDokumentasjonen'
  | 'NavKanHenteDokumentasjon';

type VisningsType = 'fyllUt' | 'dokumentinnsending' | 'ettersending' | 'lospost' | 'nologin';
