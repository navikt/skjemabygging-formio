import { SubmissionAddress } from '../../models';
import { toAddressValidationFields } from './addressFields';

const address: SubmissionAddress = {
  borDuINorge: 'ja',
  vegadresseEllerPostboksadresse: 'postboksadresse',
  adresse: 'Inactive street',
  postboks: '123',
  postnummer: '0123',
  bySted: 'Oslo',
  landkode: 'NO',
  land: { value: 'NO', label: 'Norge' },
};

describe('shared address validation fields', () => {
  it('uses the rendered domestic address branch and postal-code rule for paper users', () => {
    const fields = toAddressValidationFields({
      statePath: 'address',
      addressTypeWizard: 'user',
      required: true,
      value: address,
      submissionMethod: 'paper',
    });
    expect(fields.map(({ statePath }) => statePath)).toEqual([
      'address.borDuINorge',
      'address.vegadresseEllerPostboksadresse',
      'address.co',
      'address.postboks',
      'address.postnummer',
      'address.bySted',
    ]);
    expect(fields.find(({ statePath }) => statePath === 'address.postnummer')).toMatchObject({
      value: '0123',
      rules: { postalCode: true, required: true },
    });
  });

  it('requires foreign street and country but not a Norwegian postal code', () => {
    const fields = toAddressValidationFields({
      statePath: 'address',
      addressTypeWizard: 'user',
      required: true,
      value: { ...address, borDuINorge: 'nei' },
      submissionMethod: 'paper',
    });
    expect(fields.find(({ statePath }) => statePath === 'address.postnummer')?.rules).toEqual({
      coverPageValue: true,
      required: false,
    });
    expect(fields.find(({ statePath }) => statePath === 'address.land')?.rules.required).toBe(true);
    expect(fields.some(({ statePath }) => statePath === 'address.postboks')).toBe(false);
  });

  it('preserves the narrower fields of read-only predefined addresses', () => {
    const fields = toAddressValidationFields({
      statePath: 'address',
      addressType: 'NORWEGIAN_ADDRESS',
      required: true,
      readOnly: true,
      value: { ...address, borDuINorge: undefined, postboks: undefined, bySted: '' },
      submissionMethod: 'digital',
    });
    expect(fields.map(({ statePath }) => statePath)).toEqual(['address.adresse', 'address.postnummer']);
  });
});
