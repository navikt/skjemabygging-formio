import { describe, expect, it } from 'vitest';
import { Component, Form, SubmissionData } from '../../models';
import { navFormPartyAdapter } from './navFormPartyAdapter';

const form = (components: Partial<Component>[]): Form =>
  ({
    components,
  }) as Form;

describe('navFormPartyAdapter', () => {
  it('maps Dine opplysninger to a self relationship', () => {
    const navForm = form([{ key: 'yourInformation', type: 'container', yourInformation: true }]);
    expect(
      navFormPartyAdapter.getPartyInput(navForm, {
        yourInformation: {
          fornavn: 'Ada',
          etternavn: 'Lovelace',
          identitet: { identitetsnummer: '010101 01006' },
        },
      }),
    ).toEqual({
      relationship: 'self',
      personFillingIn: {
        type: 'person',
        firstName: 'Ada',
        surname: 'Lovelace',
        nationalIdentityNumber: '010101 01006',
      },
      responsibleSender: {
        type: 'person',
        firstName: 'Ada',
        surname: 'Lovelace',
        nationalIdentityNumber: '010101 01006',
      },
      concernedUser: {
        type: 'identified',
        firstName: 'Ada',
        surname: 'Lovelace',
        nationalIdentityNumber: '010101 01006',
      },
    });
  });

  it('maps a person sender before legacy sender fields', () => {
    const navForm = form([
      { key: 'yourInformation', type: 'container', yourInformation: true },
      { key: 'sender', type: 'sender', input: true },
    ]);
    const submission = {
      yourInformation: {
        fornavn: 'Ola',
        etternavn: 'Nordmann',
        adresse: {
          borDuINorge: 'ja',
          vegadresseEllerPostboksadresse: 'vegadresse',
          adresse: 'Testveien 1',
          postnummer: '0123',
          bySted: 'Oslo',
        },
      },
      sender: {
        person: {
          firstName: 'Ada',
          surname: 'Lovelace',
          nationalIdentityNumber: '010101 01006',
        },
      },
      fornavnAvsender: 'Legacy',
      etternavnAvsender: 'Sender',
    } as SubmissionData;

    expect(navFormPartyAdapter.getPartyInput(navForm, submission)).toEqual({
      relationship: 'anotherPerson',
      personFillingIn: {
        type: 'person',
        firstName: 'Ada',
        surname: 'Lovelace',
        nationalIdentityNumber: '010101 01006',
      },
      responsibleSender: {
        type: 'person',
        firstName: 'Ada',
        surname: 'Lovelace',
        nationalIdentityNumber: '010101 01006',
      },
      concernedUser: {
        type: 'unidentified',
        firstName: 'Ola',
        surname: 'Nordmann',
        address: {
          type: 'norwegianStreet',
          co: undefined,
          street: 'Testveien 1',
          postalCode: '0123',
          postalName: 'Oslo',
        },
      },
    });
  });

  it('maps an organization sender and uses the authenticated identity only for the filler', () => {
    const navForm = form([
      { key: 'yourInformation', type: 'container', yourInformation: true },
      { key: 'sender', type: 'sender', input: true },
    ]);
    const input = navFormPartyAdapter.getPartyInput(
      navForm,
      {
        yourInformation: {
          identitet: { identitetsnummer: '020202 01056' },
        },
        sender: { organization: { name: 'Example AS', number: '889 640 782' } },
      },
      { authenticatedIdentityNumber: '010101 01006' },
    );

    expect(input).toMatchObject({
      relationship: 'organization',
      personFillingIn: { nationalIdentityNumber: '010101 01006' },
      responsibleSender: { type: 'organization', organizationNumber: '889 640 782' },
      concernedUser: { type: 'identified', nationalIdentityNumber: '020202 01056' },
    });
  });

  it('uses the verified identity instead of a client-provided identity for self', () => {
    const navForm = form([{ key: 'yourInformation', type: 'container', yourInformation: true }]);
    const input = navFormPartyAdapter.getPartyInput(
      navForm,
      { yourInformation: { identitet: { identitetsnummer: '020202 01056' } } },
      { authenticatedIdentityNumber: '010101 01006' },
    );

    expect(input.personFillingIn?.nationalIdentityNumber).toBe('010101 01006');
    expect(input.concernedUser).toMatchObject({ nationalIdentityNumber: '010101 01006' });
  });

  it('preserves legacy person and address fields', () => {
    expect(
      navFormPartyAdapter.getPartyInput(form([]), {
        fodselsnummerDNummerSoker: '010101 01006',
        fornavnSoker: 'Ada',
        etternavnSoker: 'Lovelace',
        gateadresseSoker: 'Testveien 1',
        postnummerSoker: '0123',
        poststedSoker: 'Oslo',
      }),
    ).toMatchObject({
      relationship: 'self',
      concernedUser: {
        type: 'identified',
        nationalIdentityNumber: '010101 01006',
      },
    });
  });

  it('uses legacy sender names when no sender component has a value', () => {
    expect(
      navFormPartyAdapter.getPartyInput(form([]), {
        fodselsnummerDNummerSoker: '020202 01056',
        fornavnAvsender: 'Ada',
        etternavnAvsender: 'Lovelace',
      }),
    ).toMatchObject({
      relationship: 'anotherPerson',
      responsibleSender: {
        type: 'person',
        firstName: 'Ada',
        surname: 'Lovelace',
      },
      concernedUser: {
        type: 'identified',
        nationalIdentityNumber: '020202 01056',
      },
    });
  });

  it('keeps organization coverPageUser as an explicit legacy branch after Dine opplysninger precedence', () => {
    const organizationComponent = { key: 'organizationNumber', type: 'orgNr', coverPageUser: true };
    expect(
      navFormPartyAdapter.getCoverPagePartyInput(form([organizationComponent]), {
        organizationNumber: '889 640 782',
      }),
    ).toEqual({
      type: 'legacyOrganization',
      organizationNumber: '889640782',
    });

    expect(
      navFormPartyAdapter.getCoverPagePartyInput(
        form([{ key: 'yourInformation', type: 'container', yourInformation: true }, organizationComponent]),
        {
          yourInformation: { identitet: { identitetsnummer: '010101 01006' } },
          organizationNumber: '889 640 782',
        },
      ),
    ).toMatchObject({ type: 'party', input: { relationship: 'self' } });
  });
});
