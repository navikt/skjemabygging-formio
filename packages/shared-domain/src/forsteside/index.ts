type ForstesideType = 'SKJEMA' | 'ETTERSENDELSE';

interface Bruker {
  brukerId: string;
  brukerType: string;
}

export interface UkjentBruker {
  ukjentBrukerPersoninfo: string;
}

export interface KjentBruker {
  bruker: Bruker;
}

export interface ForstesideRequestBody {
  foerstesidetype: ForstesideType;
  navSkjemaId: string;
  spraakkode: string;
  overskriftstittel: string;
  arkivtittel: string;
  tema: string;
  vedleggsliste: string[];
  dokumentlisteFoersteside: string[];
  netsPostboks?: string;
  adresse?: ForstesideRecipientAddress;
  bruker?: Bruker;
  ukjentBrukerPersoninfo?: string;
  enhetsnummer?: string;
}

export interface ForstesideRecipientAddress {
  adresselinje1: string;
  adresselinje2?: string;
  adresselinje3?: string;
  postnummer: string;
  poststed: string;
}
