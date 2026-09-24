import {
  AddressType,
  CustomLabels,
  PrefillKey,
  SubmissionAddress,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinitionSubmissionMethod } from '../../context/form-definition/FormDefinitionContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import CountrySelect from '../country-select/CountrySelect';
import PostalCode from '../postal-code/PostalCode';
import RadioGroup from '../radio-group/RadioGroup';
import FormElementBox from '../shared/FormElementBox';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';
import { AddressTypeWizard, resolveAddressType, shouldShowAddressTypeChoice } from './addressUtils';

interface AddressProps extends Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly' | 'fieldSize'> {
  addressType?: AddressType;
  addressTypeWizard?: AddressTypeWizard;
  prefillKey?: PrefillKey | PrefillKey[];
  customLabels?: CustomLabels;
}

const Address = ({
  statePath,
  addressType,
  addressTypeWizard,
  prefillKey,
  customLabels,
  required = false,
  readOnly,
  fieldSize,
}: AddressProps) => {
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { stateValue } = useFieldBinding({ statePath });
  const address = stateValue as SubmissionAddress | undefined;
  const effectiveReadOnly = readOnly;
  const showAddressChoice = shouldShowAddressTypeChoice({ prefillKey, addressTypeWizard }, submissionMethod);
  const resolvedAddressType = resolveAddressType({ addressType, prefillKey }, address, submissionMethod);
  const coReadMore = !effectiveReadOnly
    ? {
        label: TEXTS.statiske.address.co.readMore.header,
        text: TEXTS.statiske.address.co.readMore.content,
      }
    : undefined;

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom="space-0">
      {showAddressChoice && (
        <RadioGroup
          statePath={`${statePath}.borDuINorge`}
          legend={customLabels?.livesInNorway ?? TEXTS.statiske.address.livesInNorway}
          values={[
            { value: 'ja', label: TEXTS.common.yes },
            { value: 'nei', label: TEXTS.common.no },
          ]}
          required={required}
          readOnly={effectiveReadOnly}
        />
      )}

      {showAddressChoice && address?.borDuINorge === 'ja' && (
        <RadioGroup
          statePath={`${statePath}.vegadresseEllerPostboksadresse`}
          legend={TEXTS.statiske.address.yourContactAddress}
          values={[
            { value: 'vegadresse', label: TEXTS.statiske.address.streetAddress },
            { value: 'postboksadresse', label: TEXTS.statiske.address.poAddress },
          ]}
          required={required}
          readOnly={effectiveReadOnly}
        />
      )}

      {resolvedAddressType === 'NORWEGIAN_ADDRESS' && (
        <>
          {(!effectiveReadOnly || address?.co) && (
            <TextField
              statePath={`${statePath}.co`}
              label={TEXTS.statiske.address.co.label}
              required={false}
              readOnly={effectiveReadOnly}
              readMore={coReadMore}
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.adresse) && (
            <TextField
              statePath={`${statePath}.adresse`}
              label={TEXTS.statiske.address.streetAddress}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="street-address"
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.postnummer) && (
            <PostalCode
              statePath={`${statePath}.postnummer`}
              label={TEXTS.statiske.address.postalCode}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="postal-code"
            />
          )}
          {(!effectiveReadOnly || address?.bySted) && (
            <TextField
              statePath={`${statePath}.bySted`}
              label={TEXTS.statiske.address.postalName}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="address-level2"
              validation={{ coverPageValue: true }}
            />
          )}
        </>
      )}

      {resolvedAddressType === 'POST_OFFICE_BOX' && (
        <>
          {(!effectiveReadOnly || address?.co) && (
            <TextField
              statePath={`${statePath}.co`}
              label={TEXTS.statiske.address.co.label}
              required={false}
              readOnly={effectiveReadOnly}
              readMore={coReadMore}
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.postboks) && (
            <TextField
              statePath={`${statePath}.postboks`}
              label={TEXTS.statiske.address.poBox}
              required={required}
              readOnly={effectiveReadOnly}
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.postnummer) && (
            <PostalCode
              statePath={`${statePath}.postnummer`}
              label={TEXTS.statiske.address.postalCode}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="postal-code"
            />
          )}
          {(!effectiveReadOnly || address?.bySted) && (
            <TextField
              statePath={`${statePath}.bySted`}
              label={TEXTS.statiske.address.postalName}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="address-level2"
              validation={{ coverPageValue: true }}
            />
          )}
        </>
      )}

      {resolvedAddressType === 'FOREIGN_ADDRESS' && (
        <>
          {(!effectiveReadOnly || address?.co) && (
            <TextField
              statePath={`${statePath}.co`}
              label={TEXTS.statiske.address.co.label}
              required={false}
              readOnly={effectiveReadOnly}
              readMore={coReadMore}
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.adresse) && (
            <TextField
              statePath={`${statePath}.adresse`}
              label={TEXTS.statiske.address.streetAddressLong}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="street-address"
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.bygning) && (
            <TextField
              statePath={`${statePath}.bygning`}
              label={TEXTS.statiske.address.building}
              required={false}
              readOnly={effectiveReadOnly}
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.postnummer) && (
            <TextField
              statePath={`${statePath}.postnummer`}
              label={TEXTS.statiske.address.postalCode}
              required={false}
              readOnly={effectiveReadOnly}
              autoComplete="postal-code"
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.bySted) && (
            <TextField
              statePath={`${statePath}.bySted`}
              label={TEXTS.statiske.address.location}
              required={false}
              readOnly={effectiveReadOnly}
              autoComplete="address-level2"
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.region) && (
            <TextField
              statePath={`${statePath}.region`}
              label={TEXTS.statiske.address.region}
              required={false}
              readOnly={effectiveReadOnly}
              autoComplete="address-level1"
              validation={{ coverPageValue: true }}
            />
          )}
          {(!effectiveReadOnly || address?.land) && (
            <CountrySelect
              statePath={`${statePath}.land`}
              label={TEXTS.statiske.address.country}
              selectText={TEXTS.statiske.address.selectCountry}
              ignoreOptions={['NO']}
              required={required}
              readOnly={effectiveReadOnly}
            />
          )}
        </>
      )}
    </FormElementBox>
  );
};

export default Address;
export type { AddressProps };
