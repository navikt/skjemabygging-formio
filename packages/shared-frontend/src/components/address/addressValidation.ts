import { CustomLabels, SubmissionAddress, SubmissionMethod, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { toPostalCodeValidation } from '../postal-code/PostalCode';
import { toFieldValidation, toValidationFields } from '../shared/fieldValidation';
import { AddressConfig, getPrefilledAddress, resolveAddressType, shouldShowAddressTypeChoice } from './addressUtils';

interface AddressValidationInput extends AddressConfig {
  statePath: string;
  required?: boolean;
  readOnly?: boolean;
  customLabels?: CustomLabels;
  /** The address stored in state, before the prefilled address is applied. */
  value?: SubmissionAddress;
  submissionMethod?: SubmissionMethod;
  currentLanguage: string;
}

interface AddressPartInput {
  statePath: string;
  label: string;
  required: boolean;
  value: unknown;
  validation?: { coverPageValue?: boolean; postalCode?: boolean };
}

const toAddressPart = ({
  statePath,
  label,
  required,
  value,
  validation = { coverPageValue: true },
}: AddressPartInput) =>
  toValidationFields(
    statePath,
    value,
    validation?.postalCode
      ? toPostalCodeValidation({ statePath, label, required, validation })
      : toFieldValidation({ statePath, label, required, validation }),
  );

/**
 * The fields an address renders for the address type it currently resolves to. Pure, so the
 * rendered component and the headless page rebuild always agree on which nested paths are
 * validated, including the read-only/prefilled variants that render fewer fields.
 */
const toAddressValidationFields = ({
  statePath,
  addressPriority,
  addressType,
  addressTypeWizard,
  prefillKey,
  prefillValue,
  customLabels,
  required = false,
  readOnly,
  value,
  submissionMethod,
  currentLanguage,
}: AddressValidationInput): ValidationField[] => {
  const prefilledAddress = getPrefilledAddress({ addressPriority, prefillValue }, currentLanguage);
  const address = value ?? prefilledAddress;
  const effectiveReadOnly = readOnly || prefilledAddress !== undefined;
  const showAddressChoice = shouldShowAddressTypeChoice({ prefillKey, addressTypeWizard }, submissionMethod);
  const resolvedAddressType = resolveAddressType({ addressType, prefillKey }, address, submissionMethod);
  const isRendered = (partValue: unknown) => !effectiveReadOnly || !!partValue;

  if (prefilledAddress && value === undefined) {
    return [];
  }

  const choiceFields: ValidationField[] = showAddressChoice
    ? [
        ...toValidationFields(
          `${statePath}.borDuINorge`,
          address?.borDuINorge,
          toFieldValidation({
            statePath: `${statePath}.borDuINorge`,
            label: customLabels?.livesInNorway ?? TEXTS.statiske.address.livesInNorway,
            required,
          }),
        ),
        ...(address?.borDuINorge === 'ja'
          ? toValidationFields(
              `${statePath}.vegadresseEllerPostboksadresse`,
              address?.vegadresseEllerPostboksadresse,
              toFieldValidation({
                statePath: `${statePath}.vegadresseEllerPostboksadresse`,
                label: TEXTS.statiske.address.yourContactAddress,
                required,
              }),
            )
          : []),
      ]
    : [];

  const coFields = isRendered(address?.co)
    ? toAddressPart({
        statePath: `${statePath}.co`,
        label: TEXTS.statiske.address.co.label,
        required: false,
        value: address?.co,
      })
    : [];

  if (resolvedAddressType === 'NORWEGIAN_ADDRESS' || resolvedAddressType === 'POST_OFFICE_BOX') {
    const isPostOfficeBox = resolvedAddressType === 'POST_OFFICE_BOX';
    const streetKey = isPostOfficeBox ? 'postboks' : 'adresse';
    const streetValue = isPostOfficeBox ? address?.postboks : address?.adresse;

    return [
      ...choiceFields,
      ...coFields,
      ...(isRendered(streetValue)
        ? toAddressPart({
            statePath: `${statePath}.${streetKey}`,
            label: isPostOfficeBox ? TEXTS.statiske.address.poBox : TEXTS.statiske.address.streetAddress,
            required,
            value: streetValue,
          })
        : []),
      ...(isRendered(address?.postnummer)
        ? toAddressPart({
            statePath: `${statePath}.postnummer`,
            label: TEXTS.statiske.address.postalCode,
            required,
            value: address?.postnummer,
            validation: { postalCode: true },
          })
        : []),
      ...(isRendered(address?.bySted)
        ? toAddressPart({
            statePath: `${statePath}.bySted`,
            label: TEXTS.statiske.address.postalName,
            required,
            value: address?.bySted,
          })
        : []),
    ];
  }

  if (resolvedAddressType === 'FOREIGN_ADDRESS') {
    return [
      ...choiceFields,
      ...coFields,
      ...(isRendered(address?.adresse)
        ? toAddressPart({
            statePath: `${statePath}.adresse`,
            label: TEXTS.statiske.address.streetAddressLong,
            required,
            value: address?.adresse,
          })
        : []),
      ...(isRendered(address?.bygning)
        ? toAddressPart({
            statePath: `${statePath}.bygning`,
            label: TEXTS.statiske.address.building,
            required: false,
            value: address?.bygning,
          })
        : []),
      ...(isRendered(address?.postnummer)
        ? toAddressPart({
            statePath: `${statePath}.postnummer`,
            label: TEXTS.statiske.address.postalCode,
            required: false,
            value: address?.postnummer,
          })
        : []),
      ...(isRendered(address?.bySted)
        ? toAddressPart({
            statePath: `${statePath}.bySted`,
            label: TEXTS.statiske.address.location,
            required: false,
            value: address?.bySted,
          })
        : []),
      ...(isRendered(address?.region)
        ? toAddressPart({
            statePath: `${statePath}.region`,
            label: TEXTS.statiske.address.region,
            required: false,
            value: address?.region,
          })
        : []),
      ...(isRendered(address?.land)
        ? toValidationFields(
            `${statePath}.land`,
            address?.land,
            toFieldValidation({
              statePath: `${statePath}.land`,
              label: TEXTS.statiske.address.country,
              required,
            }),
          )
        : []),
    ];
  }

  return choiceFields;
};

export { toAddressValidationFields };
export type { AddressValidationInput };
