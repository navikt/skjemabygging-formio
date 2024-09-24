import { Alert, Link, Select } from '@navikt/ds-react';
import { MottaksadresseData, NavFormSettingsDiff, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { Link as ReactRouterLink } from 'react-router-dom';
import useMottaksadresser from '../../../hooks/useMottaksadresser';
import LabelWithDiff from '../LabelWithDiff';
import { UpdateFormFunction } from '../utils/utils';

export interface AddressFieldsProps {
  onChange: UpdateFormFunction;
  diff: NavFormSettingsDiff;
  form: NavFormType;
}

const AddressFields = ({ onChange, diff, form }: AddressFieldsProps) => {
  const innsending = form.properties.innsending || 'PAPIR_OG_DIGITAL';
  const mottaksadresseId = form.properties.mottaksadresseId;
  const isLockedForm = form.properties.isLockedForm;
  const { mottaksadresser, ready: isMottaksAdresserReady, errorMessage: mottaksadresseError } = useMottaksadresser();

  const toAddressString = (address: MottaksadresseData) => {
    const linjer = [address.adresselinje1];
    if (address.adresselinje2) {
      linjer.push(address.adresselinje2);
    }
    if (address.adresselinje3) {
      linjer.push(address.adresselinje3);
    }
    return `${linjer.join(', ')}, ${address.postnummer} ${address.poststed}`;
  };

  return (
    <>
      {(innsending === 'KUN_PAPIR' || innsending === 'PAPIR_OG_DIGITAL') && (
        <div>
          <Select
            className="mb-4"
            label={<LabelWithDiff label="Mottaksadresse" diff={!!diff.mottaksadresseId} />}
            name="form-mottaksadresse"
            id="form-mottaksadresse"
            value={mottaksadresseId}
            disabled={!isMottaksAdresserReady || isLockedForm}
            onChange={(event) =>
              onChange({
                ...form,
                properties: {
                  ...form.properties,
                  mottaksadresseId: event.target.value || undefined,
                  enhetMaVelgesVedPapirInnsending: false,
                },
              })
            }
          >
            <option value="">
              {mottaksadresseId && !isMottaksAdresserReady ? `Mottaksadresse-id: ${mottaksadresseId}` : 'Standard'}
            </option>
            {mottaksadresser.map((adresse) => (
              <option value={adresse._id} key={adresse._id}>
                {toAddressString(adresse.data)}
              </option>
            ))}
          </Select>
          {mottaksadresseError && (
            <Alert variant="error" size="small">
              {mottaksadresseError}
            </Alert>
          )}
        </div>
      )}
      <div className="mb">
        <Link as={ReactRouterLink} to="/mottaksadresser">
          Rediger mottaksadresser
        </Link>
      </div>
    </>
  );
};

export default AddressFields;
