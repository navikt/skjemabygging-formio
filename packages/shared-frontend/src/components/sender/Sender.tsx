import { Component, CustomLabels, SubmissionSender, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useStateField } from '../../context/state/useStateField';
import Alert from '../alert/Alert';
import ReadMore from '../read-more/ReadMore';
import TextField from '../text-field/TextField';
import { BaseFieldProps } from '../types';

const ORGANIZATION_NUMBER_LABEL = 'Organisasjonsnummer';
const ORGANIZATION_NAME_LABEL = 'Virksomhetsnavn';

interface SenderPrefillValue {
  sokerIdentifikasjonsnummer?: string;
  sokerFornavn?: string;
  sokerEtternavn?: string;
}

interface SenderProps extends Pick<BaseFieldProps, 'statePath' | 'required' | 'readOnly' | 'readMore'> {
  senderRole?: 'person' | 'organization';
  customLabels?: CustomLabels;
  descriptions?: Record<string, string>;
  prefillValue?: Component['prefillValue'];
}

const isSenderPrefillValue = (value: Component['prefillValue']): value is SenderPrefillValue =>
  typeof value === 'object' && value !== null;

const Sender = ({
  statePath,
  required = false,
  readOnly,
  readMore,
  senderRole = 'person',
  customLabels,
  descriptions,
  prefillValue,
}: SenderProps) => {
  const { submissionMethod } = useAppConfig();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const prefilledSender = useMemo<SubmissionSender | undefined>(() => {
    if (senderRole !== 'person' || !isSenderPrefillValue(prefillValue)) {
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
  }, [prefillValue, senderRole]);

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
    <>
      {senderRole === 'organization' ? (
        <>
          <TextField
            statePath={`${statePath}.organization.number`}
            label={customLabels?.organizationNumber ?? ORGANIZATION_NUMBER_LABEL}
            description={descriptions?.organizationNumber}
            required={required}
            readOnly={effectiveReadOnly}
            inputMode="numeric"
            formatKey="organizationNumberRaw"
          />
          <TextField
            statePath={`${statePath}.organization.name`}
            label={customLabels?.organizationName ?? ORGANIZATION_NAME_LABEL}
            required={required}
            readOnly={effectiveReadOnly}
          />
        </>
      ) : (
        <>
          <TextField
            statePath={`${statePath}.person.nationalIdentityNumber`}
            label={customLabels?.nationalIdentityNumber ?? TEXTS.statiske.identity.identityNumber}
            description={descriptions?.nationalIdentityNumber}
            required={required}
            readOnly={effectiveReadOnly}
            inputMode="numeric"
            formatKey="identityNumberRaw"
          />
          <TextField
            statePath={`${statePath}.person.firstName`}
            label={customLabels?.firstName ?? TEXTS.statiske.identity.firstName}
            required={required}
            readOnly={effectiveReadOnly}
          />
          <TextField
            statePath={`${statePath}.person.surname`}
            label={customLabels?.surname ?? TEXTS.statiske.identity.surname}
            required={required}
            readOnly={effectiveReadOnly}
          />
        </>
      )}
      {showApplicationInsight && <Alert variant="info">{TEXTS.statiske.sender.applicationInsight}</Alert>}
      {readMore && <ReadMore {...readMore} />}
    </>
  );
};

export default Sender;
export type { SenderProps };
