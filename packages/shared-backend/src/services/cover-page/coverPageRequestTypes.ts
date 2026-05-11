import { CoverPageType } from '@navikt/skjemadigitalisering-shared-domain';

interface Bruker {
  brukerId: string;
  brukerType: string;
}

interface ForstesideRequestBody {
  foerstesidetype: CoverPageType;
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

interface ForstesideRecipientAddress {
  adresselinje1: string;
  adresselinje2?: string;
  adresselinje3?: string;
  postnummer: string;
  poststed: string;
}

export type { ForstesideRequestBody };
