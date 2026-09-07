import { CustomLabels, SubmissionSender, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useStateField } from '../../context/state/useStateField';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import Alert from '../alert/Alert';
import NationalIdentityNumber from '../national-identity-number/NationalIdentityNumber';
import OrganizationNumber from '../organization-number/OrganizationNumber';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';
import {
  getPrefilledSender,
  ORGANIZATION_NAME_LABEL,
  ORGANIZATION_NUMBER_LABEL,
  SenderPrefillValue,
} from './senderValidation';

interface SenderProps extends Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly' | 'readMore' | 'fieldSize'> {
  senderRole?: 'person' | 'organization';
  customLabels?: CustomLabels;
  descriptions?: Record<string, string>;
  prefillValue?: SenderPrefillValue;
}

const Sender = ({
  statePath,
  required = false,
  readOnly,
  readMore,
  fieldSize,
  senderRole = 'person',
  customLabels,
  descriptions,
  prefillValue,
}: SenderProps) => {
  const { submissionMethod } = useSubmissionMethod();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const prefilledSender = useMemo<SubmissionSender | undefined>(
    () => getPrefilledSender(senderRole, prefillValue),
    [prefillValue, senderRole],
  );

  useEffect(() => {
    if (prefilledSender && stateValue === undefined) {
      setStateValue(prefilledSender);
    }
  }, [prefilledSender, setStateValue, stateValue]);

  if (prefilledSender && stateValue === undefined) {
    return null;
  }

  const effectiveReadOnly = readOnly || prefilledSender !== undefined;
  const showApplicationInsight = submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom="space-0">
      {senderRole === 'organization' ? (
        <>
          <OrganizationNumber
            statePath={`${statePath}.organization.number`}
            label={customLabels?.organizationNumber ?? ORGANIZATION_NUMBER_LABEL}
            description={descriptions?.organizationNumber}
            required={required}
            readOnly={effectiveReadOnly}
            rawFormat
          />
          <TextField
            statePath={`${statePath}.organization.name`}
            label={customLabels?.organizationName ?? ORGANIZATION_NAME_LABEL}
            required={required}
            readOnly={effectiveReadOnly}
            validation={{ coverPageValue: true }}
          />
        </>
      ) : (
        <>
          <NationalIdentityNumber
            statePath={`${statePath}.person.nationalIdentityNumber`}
            label={customLabels?.nationalIdentityNumber ?? TEXTS.statiske.identity.identityNumber}
            description={descriptions?.nationalIdentityNumber}
            required={required}
            readOnly={effectiveReadOnly}
            rawFormat
          />
          <TextField
            statePath={`${statePath}.person.firstName`}
            label={customLabels?.firstName ?? TEXTS.statiske.identity.firstName}
            required={required}
            readOnly={effectiveReadOnly}
            validation={{ coverPageValue: true }}
          />
          <TextField
            statePath={`${statePath}.person.surname`}
            label={customLabels?.surname ?? TEXTS.statiske.identity.surname}
            required={required}
            readOnly={effectiveReadOnly}
            validation={{ coverPageValue: true }}
          />
        </>
      )}
      {showApplicationInsight && <Alert variant="info">{TEXTS.statiske.sender.applicationInsight}</Alert>}
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default Sender;
export type { SenderPrefillValue, SenderProps };
