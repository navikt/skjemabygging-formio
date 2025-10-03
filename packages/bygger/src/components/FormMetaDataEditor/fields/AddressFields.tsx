import { Link, Select } from '@navikt/ds-react';
import { Form, FormSettingsDiff, Recipient, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Link as ReactRouterLink } from 'react-router';
import { useRecipients } from '../../../context/recipients/RecipientsContext';
import LabelWithDiff from '../LabelWithDiff';
import { UpdateFormFunction } from '../utils/utils';

export interface AddressFieldsProps {
  onChange: UpdateFormFunction;
  diff: FormSettingsDiff;
  form: Form;
}

const AddressFields = ({ onChange, diff, form }: AddressFieldsProps) => {
  const { submissionTypes, mottaksadresseId } = form.properties;
  const isLockedForm = !!form.lock;
  const { isReady: isMottaksAdresserReady, recipients } = useRecipients();

  const toAddressString = (recipient: Recipient) => {
    return `${recipient.name}, ${recipient.poBoxAddress}, ${recipient.postalCode} ${recipient.postalName}`;
  };
  return (
    <>
      {submissionTypesUtils.isPaperSubmission(submissionTypes) && (
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
            {recipients.map((recipient) => (
              <option value={recipient.recipientId} key={recipient.recipientId}>
                {toAddressString(recipient)}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="mb">
        <Link as={ReactRouterLink} to="/mottakere">
          Rediger mottaksadresser
        </Link>
      </div>
    </>
  );
};

export default AddressFields;
