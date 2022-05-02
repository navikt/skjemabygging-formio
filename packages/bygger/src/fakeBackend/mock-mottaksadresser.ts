import { MottaksadresseEntity } from "@navikt/skjemadigitalisering-shared-domain";

const mottaksadresser: MottaksadresseEntity[] = [
  {
    _id: "1",
    data: {
      adresselinje1: "NAV alternativ skanning",
      adresselinje2: "Postboks 3",
      postnummer: "0591",
      poststed: "Oslo",
    },
  },
  {
    _id: "2",
    data: {
      adresselinje1: "NAV skanning Molde",
      adresselinje2: "Storgata 1",
      postnummer: "6400",
      poststed: "Molde",
    },
  },
];
export default mottaksadresser;
