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
  assembleSubmitApplicationRequest('21ed0008-ec72-4c90-8b44-165d3c265da9', form, { data }, 'nb', [], (text) => text);

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

  it('maps a person sender without a separate concerned user', () => {
    const request = assembleSubmitApplicationRequest(
      '21ed0008-ec72-4c90-8b44-165d3c265da9',
      {
        ...form,
        components: [{ type: 'sender', key: 'mottakerPerson', label: 'Sender', input: true }],
      },
      {
        data: {
          mottakerPerson: {
            person: {
              firstName: 'Sender',
              surname: 'Sendersen',
              nationalIdentityNumber: '109 876 543 21',
            },
          },
        },
      },
      'nb',
      [],
      (text) => text,
    );

    expect(request.bruker).toBeUndefined();
    expect(request.avsender).toEqual({
      id: '10987654321',
      idType: 'FNR',
      navn: 'Sender Sendersen',
    });
  });

  it('maps declared flat legacy user and sender fields', () => {
    const request = assembleSubmitApplicationRequest(
      '21ed0008-ec72-4c90-8b44-165d3c265da9',
      {
        ...form,
        components: [
          { type: 'fnrfield', key: 'fodselsnummerDNummerSoker', label: 'Identity number' },
          { type: 'textfield', key: 'fornavnAvsender', label: 'First name' },
          { type: 'textfield', key: 'etternavnAvsender', label: 'Surname' },
        ],
      },
      {
        data: {
          fodselsnummerDNummerSoker: '123 456 789 11',
          fornavnAvsender: 'Legacy',
          etternavnAvsender: 'Sender',
        },
      },
      'nb',
      [],
      (text) => text,
    );

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

  it('maps the nav020807 organization case as sender and concerned user', () => {
    const request = assembleSubmitApplicationRequest(
      '21ed0008-ec72-4c90-8b44-165d3c265da9',
      {
        ...form,
        components: [
          { type: 'fnrfield', key: 'fodselsnummerDNummerSoker', label: 'Identity number' },
          { type: 'firstName', key: 'fornavnSoker', label: 'First name' },
          { type: 'surname', key: 'etternavnSoker', label: 'Surname' },
          { type: 'sender', key: 'sender', label: 'Sender', input: true },
        ],
      },
      {
        data: {
          fodselsnummerDNummerSoker: '123 456 789 11',
          sender: {
            organization: {
              number: '889 640 782',
              name: 'Test organization',
            },
          },
        },
      },
      'nb',
      [],
      (text) => text,
    );

    expect(request.bruker).toBe('12345678911');
    expect(request.avsender).toEqual({
      id: '889640782',
      idType: 'ORGNR',
      navn: 'Test organization',
    });
  });

});
