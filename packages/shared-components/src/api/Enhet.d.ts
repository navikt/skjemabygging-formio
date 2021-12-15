export type Enhetstype =
  | "AAREG"
  | "ALS"
  | "ARK"
  | "DIR"
  | "DOKSENTER"
  | "EKSTERN"
  | "FORVALTNING"
  | "FPY"
  | "FYLKE"
  | "HELFO"
  | "HMS"
  | "INNKREV"
  | "INTRO"
  | "IT"
  | "KLAGE"
  | "KO"
  | "KONTAKT"
  | "KONTROLL"
  | "LOKAL"
  | "OKONOMI"
  | "OPPFUTLAND"
  | "OTENESTE"
  | "RIKSREV"
  | "ROBOT"
  | "ROL"
  | "TILLIT"
  | "TILTAK"
  | "UKJENT"
  | "UTLAND"
  | "YTA";

export interface Enhet {
  aktiveringsdato: string;
  antallRessurser: number;
  enhetId: number;
  enhetNr: string;
  kanalstrategi: string;
  navn: string;
  nedleggelsesdato: string;
  oppgavebehandler: boolean;
  orgNivaa: string;
  orgNrTilKommunaltNavKontor: string;
  organisasjonsnummer: string;
  sosialeTjenester: string;
  status: string;
  type: Enhetstype;
  underAvviklingDato: string;
  underEtableringDato: string;
  versjon: number;
}

interface Adresse {
  postnummer: string;
  poststed: string;
}

interface PostboksAdresse extends Adresse {
  postboksanlegg?: string;
  postboksnummer: string;
  type: "postboksadresse";
}

interface Stedsadresse extends Adresse {
  adresseTilleggsnavn?: string;
  gatenavn?: string;
  husbokstav?: string;
  husnummer?: string;
  type: "stedsadresse";
}

interface Aapningstid {
  dag: string;
  dato: string;
  fra: string;
  id: number;
  kommentar: string;
  stengt: boolean;
  til: string;
}

interface Publikumsmottak {
  aapningstider: Aapningstid[];
  besoeksadresse: Stedsadresse;
  id: number;
  stedsbeskrivelse: string;
}

interface EnhetKontaktinformasjon {
  besoeksadresse: Stedsadresse;
  enhetnr: string;
  epost: {
    adresse: string;
    kommentar: string;
    kunIntern: boolean;
  };
  faksnummer: string;
  id: number;
  postadresse: PostboksAdresse | Stedsadresse;
  publikumsmottak: Publikumsmottak[];
  spesielleOpplysninger: string;
  telefonnummer: string;
  telefonnummerKommentar: string;
}

export interface EnhetInkludertKontaktinformasjon {
  enhet: Enhet;
  habilitetskontor: string[];
  kontaktinformasjon: EnhetKontaktinformasjon;
  overordnetEnhet: string;
}
