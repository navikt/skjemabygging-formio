import { CustomLabels, SubmissionSender, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { toFieldValidation, toValidationFields } from '../shared/fieldValidation';

const ORGANIZATION_NUMBER_LABEL = 'Organisasjonsnummer';
const ORGANIZATION_NAME_LABEL = 'Virksomhetsnavn';

interface SenderPrefillValue {
  sokerIdentifikasjonsnummer?: string;
  sokerFornavn?: string;
  sokerEtternavn?: string;
}

interface SenderValidationInput {
  statePath: string;
  required?: boolean;
  senderRole?: 'person' | 'organization';
  customLabels?: CustomLabels;
  /** The sender stored in state, before the prefilled sender is applied. */
  value?: SubmissionSender;
  prefillValue?: SenderPrefillValue;
}

/** The prefilled sender a person role derives from the applicant, or undefined when there is none. */
const getPrefilledSender = (
  senderRole: 'person' | 'organization',
  prefillValue?: SenderPrefillValue,
): SubmissionSender | undefined => {
  if (senderRole !== 'person' || !prefillValue) {
    return undefined;
  }

  if (!prefillValue.sokerIdentifikasjonsnummer && !prefillValue.sokerFornavn && !prefillValue.sokerEtternavn) {
    return undefined;
  }

  return {
    person: {
      nationalIdentityNumber: prefillValue.sokerIdentifikasjonsnummer ?? '',
      firstName: prefillValue.sokerFornavn ?? '',
      surname: prefillValue.sokerEtternavn ?? '',
    },
  };
};

/** The fields a sender renders for its role. */
const toSenderValidationFields = ({
  statePath,
  required = false,
  senderRole = 'person',
  customLabels,
  value,
  prefillValue,
}: SenderValidationInput): ValidationField[] => {
  const prefilledSender = getPrefilledSender(senderRole, prefillValue);

  if (prefilledSender && value === undefined) {
    return [];
  }

  const sender = value ?? prefilledSender;

  if (senderRole === 'organization') {
    const numberPath = `${statePath}.organization.number`;
    const namePath = `${statePath}.organization.name`;

    return [
      ...toValidationFields(
        numberPath,
        sender?.organization?.number,
        toFieldValidation({
          statePath: numberPath,
          label: customLabels?.organizationNumber ?? ORGANIZATION_NUMBER_LABEL,
          required,
          validation: { organizationNumber: true },
        }),
      ),
      ...toValidationFields(
        namePath,
        sender?.organization?.name,
        toFieldValidation({
          statePath: namePath,
          label: customLabels?.organizationName ?? ORGANIZATION_NAME_LABEL,
          required,
          validation: { coverPageValue: true },
        }),
      ),
    ];
  }

  const identityNumberPath = `${statePath}.person.nationalIdentityNumber`;
  const firstNamePath = `${statePath}.person.firstName`;
  const surnamePath = `${statePath}.person.surname`;

  return [
    ...toValidationFields(
      identityNumberPath,
      sender?.person?.nationalIdentityNumber,
      toFieldValidation({
        statePath: identityNumberPath,
        label: customLabels?.nationalIdentityNumber ?? TEXTS.statiske.identity.identityNumber,
        required,
        validation: { nationalIdentityNumber: true },
      }),
    ),
    ...toValidationFields(
      firstNamePath,
      sender?.person?.firstName,
      toFieldValidation({
        statePath: firstNamePath,
        label: customLabels?.firstName ?? TEXTS.statiske.identity.firstName,
        required,
        validation: { coverPageValue: true },
      }),
    ),
    ...toValidationFields(
      surnamePath,
      sender?.person?.surname,
      toFieldValidation({
        statePath: surnamePath,
        label: customLabels?.surname ?? TEXTS.statiske.identity.surname,
        required,
        validation: { coverPageValue: true },
      }),
    ),
  ];
};

export { getPrefilledSender, ORGANIZATION_NAME_LABEL, ORGANIZATION_NUMBER_LABEL, toSenderValidationFields };
export type { SenderPrefillValue, SenderValidationInput };
