import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import TextField from '../../../components/text-field/TextField';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputNationalIdentityNumber = ({ component, submissionPath }: InputComponentProps) => (
  <TextField
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label ?? TEXTS.statiske.identity.identityNumber}
    description={component.description}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
    inputMode="numeric"
    formatKey="identityNumber"
  />
);

export default InputNationalIdentityNumber;
