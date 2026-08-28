import {
  AddressType,
  CustomLabels,
  PrefillKey,
  SubmissionAddress,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import CountrySelect from '../country-select/CountrySelect';
import RadioGroup from '../radio-group/RadioGroup';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';
import {
  AddressPriority,
  AddressTypeWizard,
  getPrefilledAddress,
  resolveAddressType,
  shouldShowAddressTypeChoice,
} from './addressUtils';

interface AddressProps extends Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly'> {
  addressPriority?: AddressPriority;
  addressType?: AddressType;
  addressTypeWizard?: AddressTypeWizard;
  prefillKey?: PrefillKey | PrefillKey[];
  prefillValue?: string | object;
  customLabels?: CustomLabels;
}

const Address = ({
  statePath,
  addressPriority,
  addressType,
  addressTypeWizard,
  prefillKey,
  prefillValue,
  customLabels,
  required = false,
  readOnly,
}: AddressProps) => {
  const { submissionMethod } = useSubmissionMethod();
  const { currentLanguage } = useLanguage();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const prefilledAddress = useMemo(
    () => getPrefilledAddress({ addressPriority, prefillValue }, currentLanguage),
    [addressPriority, currentLanguage, prefillValue],
  );
  const address = ((stateValue as SubmissionAddress | undefined) ?? prefilledAddress) as SubmissionAddress | undefined;
  const hasPrefilledAddress = prefilledAddress !== undefined;
  const effectiveReadOnly = readOnly || hasPrefilledAddress;
  const showAddressChoice = shouldShowAddressTypeChoice({ prefillKey, addressTypeWizard }, submissionMethod);
  const resolvedAddressType = resolveAddressType({ addressType, prefillKey }, address, submissionMethod);
  const coReadMore = !effectiveReadOnly
    ? {
        label: TEXTS.statiske.address.co.readMore.header,
        text: TEXTS.statiske.address.co.readMore.content,
      }
    : undefined;

  useEffect(() => {
    if (prefilledAddress && stateValue === undefined) {
      setStateValue(prefilledAddress);
    }
  }, [prefilledAddress, setStateValue, stateValue]);

  if (prefilledAddress && stateValue === undefined) {
    return null;
  }

  return (
    <>
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
            />
          )}
          {(!effectiveReadOnly || address?.adresse) && (
            <TextField
              statePath={`${statePath}.adresse`}
              label={TEXTS.statiske.address.streetAddress}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="street-address"
            />
          )}
          {(!effectiveReadOnly || address?.postnummer) && (
            <TextField
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
            />
          )}
          {(!effectiveReadOnly || address?.postboks) && (
            <TextField
              statePath={`${statePath}.postboks`}
              label={TEXTS.statiske.address.poBox}
              required={required}
              readOnly={effectiveReadOnly}
            />
          )}
          {(!effectiveReadOnly || address?.postnummer) && (
            <TextField
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
            />
          )}
          {(!effectiveReadOnly || address?.adresse) && (
            <TextField
              statePath={`${statePath}.adresse`}
              label={TEXTS.statiske.address.streetAddressLong}
              required={required}
              readOnly={effectiveReadOnly}
              autoComplete="street-address"
            />
          )}
          {(!effectiveReadOnly || address?.bygning) && (
            <TextField
              statePath={`${statePath}.bygning`}
              label={TEXTS.statiske.address.building}
              required={false}
              readOnly={effectiveReadOnly}
            />
          )}
          {(!effectiveReadOnly || address?.postnummer) && (
            <TextField
              statePath={`${statePath}.postnummer`}
              label={TEXTS.statiske.address.postalCode}
              required={false}
              readOnly={effectiveReadOnly}
              autoComplete="postal-code"
            />
          )}
          {(!effectiveReadOnly || address?.bySted) && (
            <TextField
              statePath={`${statePath}.bySted`}
              label={TEXTS.statiske.address.location}
              required={false}
              readOnly={effectiveReadOnly}
              autoComplete="address-level2"
            />
          )}
          {(!effectiveReadOnly || address?.region) && (
            <TextField
              statePath={`${statePath}.region`}
              label={TEXTS.statiske.address.region}
              required={false}
              readOnly={effectiveReadOnly}
              autoComplete="address-level1"
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
    </>
  );
};

export default Address;
export type { AddressProps };
