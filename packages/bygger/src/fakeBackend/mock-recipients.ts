import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';

const recipients: Recipient[] = [
  {
    recipientId: '1',
    name: 'NAV alternativ skanning',
    poBoxAddress: 'Postboks 3',
    postalCode: '0591',
    postalName: 'Oslo',
  },
  {
    recipientId: '2',
    name: 'NAV skanning Molde',
    poBoxAddress: 'Storgata 1',
    postalCode: '6400',
    postalName: 'Molde',
  },
];

export default recipients;
