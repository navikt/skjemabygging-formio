export interface SendInnSoknadBodyV2 {
  brukerDto: { id: string; idType: 'FNR' };
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
