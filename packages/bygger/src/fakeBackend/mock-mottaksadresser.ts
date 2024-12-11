import { Mottaksadresse } from '@navikt/skjemadigitalisering-shared-domain';

const mottaksadresser: Mottaksadresse[] = [
  {
    _id: '1',
    data: {
      adresselinje1: 'Nav alternativ skanning',
      adresselinje2: 'Postboks 3',
      postnummer: '0591',
      poststed: 'Oslo',
    },
    form: '9',
  },
  {
    _id: '2',
    data: {
      adresselinje1: 'Nav skanning Molde',
      adresselinje2: 'Storgata 1',
      postnummer: '6400',
      poststed: 'Molde',
    },
    form: '9',
  },
];
export default mottaksadresser;
