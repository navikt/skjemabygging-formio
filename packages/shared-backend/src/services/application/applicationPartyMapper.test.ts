import { Party } from '@navikt/skjemadigitalisering-shared-domain';
import { mapPartyToApplication } from './applicationPartyMapper';

describe('mapPartyToApplication', () => {
  it.each([
    {
      name: 'own behalf, identified',
      party: {
        relationship: 'self',
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
      expected: { bruker: '12345678911' },
    },
    {
      name: 'own behalf, unidentified',
      party: {
        relationship: 'self',
        user: {
          kind: 'unidentified-person',
          firstName: 'Test',
          surname: 'Testesen',
          address: { postalCode: '0101' },
        },
      },
      expected: { avsender: { navn: 'Test Testesen' } },
    },
    {
      name: 'another person, identified user',
      party: {
        relationship: 'other-person',
        sender: { firstName: 'Sender', surname: 'Sendersen', nationalIdentityNumber: '10987654321' },
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
      expected: {
        bruker: '12345678911',
        avsender: { id: '10987654321', idType: 'FNR', navn: 'Sender Sendersen' },
      },
    },
    {
      name: 'another person, unidentified user',
      party: {
        relationship: 'other-person',
        sender: { firstName: 'Sender', surname: 'Sendersen', nationalIdentityNumber: '10987654321' },
        user: {
          kind: 'unidentified-person',
          firstName: 'User',
          surname: 'Usersen',
          address: { postalCode: '0101' },
        },
      },
      expected: {
        avsender: { id: '10987654321', idType: 'FNR', navn: 'Sender Sendersen' },
      },
    },
    {
      name: 'organization, identified user',
      party: {
        relationship: 'organization',
        sender: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'identified-person', nationalIdentityNumber: '12345678911' },
      },
      expected: {
        bruker: '12345678911',
        avsender: { id: '889640782', idType: 'ORGNR', navn: 'Organization' },
      },
    },
    {
      name: 'organization, unidentified user',
      party: {
        relationship: 'organization',
        sender: { name: 'Organization', organizationNumber: '889640782' },
        user: {
          kind: 'unidentified-person',
          firstName: 'User',
          surname: 'Usersen',
          address: { postalCode: '0101' },
        },
      },
      expected: {
        avsender: { id: '889640782', idType: 'ORGNR', navn: 'Organization' },
      },
    },
    {
      name: 'organization, several people',
      party: {
        relationship: 'organization',
        sender: { name: 'Organization', organizationNumber: '889640782' },
        user: { kind: 'several-people', navUnit: '9999' },
      },
      expected: {
        avsender: { id: '889640782', idType: 'ORGNR', navn: 'Organization' },
      },
    },
  ] satisfies { name: string; party: Party; expected: ReturnType<typeof mapPartyToApplication> }[])(
    'maps $name',
    ({ party, expected }) => {
      expect(mapPartyToApplication(party)).toEqual(expected);
    },
  );
});
