import { Component, Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { assembleSubmitApplicationRequest } from './applicationUtils';

const form = {
  title: 'Application',
  path: 'application',
  revision: 1,
  properties: {
    skjemanummer: 'NAV 12.34-56',
    tema: 'BIL',
  },
  components: [
    {
      type: 'container',
      key: 'yourInformation',
      yourInformation: true,
      input: true,
    },
    {
      type: 'sender',
      key: 'sender',
      input: true,
    },
  ] as Component[],
} as unknown as Form;

const assemble = (data: Submission['data']) =>
  assembleSubmitApplicationRequest(
    '21ed0008-ec72-4c90-8b44-165d3c265da9',
    form,
    { data },
    'nb',
    [],
    (text) => text,
  );

describe('assembleSubmitApplicationRequest party compatibility', () => {
  it('maps an identified person acting on their own behalf', () => {
    const request = assemble({
      yourInformation: {
        fornavn: 'Test',
        etternavn: 'Testesen',
        identitet: { identitetsnummer: '123 456 789 11' },
      },
    });

    expect(request.bruker).toBe('12345678911');
    expect(request.avsender).toBeUndefined();
  });

  it('maps an unidentified person acting on their own behalf to a name-only sender', () => {
    const request = assemble({
      yourInformation: {
        fornavn: 'Test',
        etternavn: 'Testesen',
        adresse: { adresse: 'Testveien 1', postnummer: '0101', bySted: 'Oslo' },
      },
    });

    expect(request.bruker).toBeUndefined();
    expect(request.avsender).toEqual({ navn: 'Test Testesen' });
  });

  it('maps a person acting for an identified user', () => {
    const request = assemble({
      yourInformation: {
        fornavn: 'User',
        etternavn: 'Usersen',
        identitet: { identitetsnummer: '12345678911' },
      },
      sender: {
        person: {
          firstName: 'Sender',
          surname: 'Sendersen',
          nationalIdentityNumber: '109 876 543 21',
        },
      },
    });

    expect(request.bruker).toBe('12345678911');
    expect(request.avsender).toEqual({
      id: '10987654321',
      idType: 'FNR',
      navn: 'Sender Sendersen',
    });
  });

  it('maps an organization acting for an unidentified user', () => {
    const request = assemble({
      yourInformation: {
        fornavn: 'User',
        etternavn: 'Usersen',
        adresse: { adresse: 'Testveien 1', postnummer: '0101', bySted: 'Oslo' },
      },
      sender: {
        organization: {
          number: '889 640 782',
          name: 'Test organization',
        },
      },
    });

    expect(request.bruker).toBeUndefined();
    expect(request.avsender).toEqual({
      id: '889640782',
      idType: 'ORGNR',
      navn: 'Test organization',
    });
  });

  it('preserves flat legacy user and sender fields', () => {
    const request = assemble({
      fodselsnummerDNummerSoker: '123 456 789 11',
      fornavnAvsender: 'Legacy',
      etternavnAvsender: 'Sender',
    });

    expect(request.bruker).toBe('12345678911');
    expect(request.avsender).toEqual({ navn: 'Legacy Sender' });
  });

  it('preserves a name-only user as the sender', () => {
    const request = assemble({
      yourInformation: {
        fornavn: 'Name',
        etternavn: 'Only',
      },
    });

    expect(request.bruker).toBeUndefined();
    expect(request.avsender).toEqual({ navn: 'Name Only' });
  });

  it('normalizes and forwards an identity value without stricter validation', () => {
    const request = assemble({
      yourInformation: {
        fornavn: 'Invalid',
        etternavn: 'Identity',
        identitet: { identitetsnummer: 'not valid' },
      },
    });

    expect(request.bruker).toBe('notvalid');
    expect(request.avsender).toBeUndefined();
  });
});
