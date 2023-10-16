export type Enhetstype =
  | 'AAREG'
  | 'ALS'
  | 'ARK'
  | 'DIR'
  | 'DOKSENTER'
  | 'EKSTERN'
  | 'FPY'
  | 'FYLKE'
  | 'HELFO'
  | 'HMS'
  | 'INNKREV'
  | 'INTRO'
  | 'IT'
  | 'KLAGE'
  | 'KO'
  | 'KONTAKT'
  | 'KONTROLL'
  | 'LOKAL'
  | 'OKONOMI'
  | 'OPPFUTLAND'
  | 'RIKSREV'
  | 'ROBOT'
  | 'ROL'
  | 'TILLIT'
  | 'TILTAK'
  | 'UKJENT'
  | 'UTLAND'
  | 'YTA';

export interface Enhet {
  aktiveringsdato: string;
  antallRessurser: number;
  enhetId: number;
  enhetNr: string;
  kanalstrategi: string | null;
  navn: string;
  nedleggelsesdato: string | null;
  oppgavebehandler: boolean;
  orgNivaa: string;
  orgNrTilKommunaltNavKontor: string | null;
  organisasjonsnummer: string | null;
  sosialeTjenester: string | null;
  status: string;
  type: Enhetstype;
  underAvviklingDato: string | null;
  underEtableringDato: string;
  versjon: number;
}

export const supportedEnhetstyper: Enhetstype[] = [
  'ALS',
  'ARK',
  'FPY',
  'FYLKE',
  'HMS',
  'INNKREV',
  'INTRO',
  'KLAGE',
  'KO',
  'KONTROLL',
  'LOKAL',
  'OKONOMI',
  'OPPFUTLAND',
  'ROL',
  'TILTAK',
  'UTLAND',
  'YTA',
];
