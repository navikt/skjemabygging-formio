import { MottaksadresseData } from "../mottaksadresse";

type ForstesideType = "SKJEMA" | "ETTERSENDELSE";

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
  adresse?: MottaksadresseData;
  bruker?: Bruker;
  ukjentBrukerPersoninfo?: string;
  enhetsnummer?: string;
}
