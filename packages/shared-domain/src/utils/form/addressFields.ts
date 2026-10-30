import { AddressType, CustomLabels, PrefillKey, SubmissionAddress, SubmissionMethod } from '../../models';
import { TEXTS } from '../../texts';

interface AddressConfig {
  addressType?: AddressType;
  addressTypeWizard?: 'predefined' | 'user';
  prefillKey?: PrefillKey | PrefillKey[];
}

interface AddressValidationInput extends AddressConfig {
  statePath: string;
  required?: boolean;
  readOnly?: boolean;
  customLabels?: CustomLabels;
  value?: SubmissionAddress;
  submissionMethod?: SubmissionMethod;
}

interface AddressValidationField {
  statePath: string;
  field: string;
  value: unknown;
  rules: { required?: boolean; coverPageValue?: boolean; postalCode?: boolean };
}

const resolveAddressType = (
  config: Pick<AddressConfig, 'addressType' | 'prefillKey'>,
  address?: SubmissionAddress,
  submissionMethod?: SubmissionMethod,
): AddressType | undefined => {
  if (config.addressType) return config.addressType;
  if (address?.borDuINorge === 'ja') {
    if (address.vegadresseEllerPostboksadresse === 'vegadresse') return 'NORWEGIAN_ADDRESS';
    if (address.vegadresseEllerPostboksadresse === 'postboksadresse') return 'POST_OFFICE_BOX';
  }
  if (address?.borDuINorge === 'nei') return 'FOREIGN_ADDRESS';
  const countryCode = address?.landkode ?? address?.land?.value;
  if (typeof countryCode === 'string' && !['NO', 'NOR'].includes(countryCode.toUpperCase())) {
    return 'FOREIGN_ADDRESS';
  }
  if (address?.postboks) return 'POST_OFFICE_BOX';
  if (config.prefillKey && submissionMethod === 'digital') return 'NORWEGIAN_ADDRESS';
};

const shouldShowAddressTypeChoice = (
  config: Pick<AddressConfig, 'prefillKey' | 'addressTypeWizard'>,
  submissionMethod?: SubmissionMethod,
) =>
  (!!config.prefillKey &&
    (submissionMethod === undefined || submissionMethod === 'paper' || submissionMethod === 'digitalnologin')) ||
  (!config.prefillKey && config.addressTypeWizard === 'user');

const toAddressValidationFields = ({
  statePath,
  addressType,
  addressTypeWizard,
  prefillKey,
  customLabels,
  required = false,
  readOnly,
  value: address,
  submissionMethod,
}: AddressValidationInput): AddressValidationField[] => {
  const fields: AddressValidationField[] = [];
  const add = (
    key: keyof SubmissionAddress,
    label: string,
    isRequired = required,
    rules: AddressValidationField['rules'] = { coverPageValue: true },
    always = false,
  ) => {
    if (always || !readOnly || address?.[key]) {
      fields.push({
        statePath: `${statePath}.${key}`,
        field: label,
        value: address?.[key],
        rules: { ...rules, required: isRequired },
      });
    }
  };
  if (shouldShowAddressTypeChoice({ prefillKey, addressTypeWizard }, submissionMethod)) {
    add('borDuINorge', customLabels?.livesInNorway ?? TEXTS.statiske.address.livesInNorway, required, {}, true);
    if (address?.borDuINorge === 'ja') {
      add('vegadresseEllerPostboksadresse', TEXTS.statiske.address.yourContactAddress, required, {}, true);
    }
  }
  add('co', TEXTS.statiske.address.co.label, false);
  const resolved = resolveAddressType({ addressType, prefillKey }, address, submissionMethod);
  if (resolved === 'NORWEGIAN_ADDRESS' || resolved === 'POST_OFFICE_BOX') {
    const box = resolved === 'POST_OFFICE_BOX';
    add(box ? 'postboks' : 'adresse', box ? TEXTS.statiske.address.poBox : TEXTS.statiske.address.streetAddress);
    add('postnummer', TEXTS.statiske.address.postalCode, required, { postalCode: true });
    add('bySted', TEXTS.statiske.address.postalName);
  } else if (resolved === 'FOREIGN_ADDRESS') {
    add('adresse', TEXTS.statiske.address.streetAddressLong);
    add('bygning', TEXTS.statiske.address.building, false);
    add('postnummer', TEXTS.statiske.address.postalCode, false);
    add('bySted', TEXTS.statiske.address.location, false);
    add('region', TEXTS.statiske.address.region, false);
    add('land', TEXTS.statiske.address.country, required, {});
  } else {
    return fields.filter((field) => !field.statePath.endsWith('.co'));
  }
  return fields;
};

export { resolveAddressType, shouldShowAddressTypeChoice, toAddressValidationFields };
export type { AddressValidationField, AddressValidationInput };
