import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import TextField from '../../../components/text-field/TextField';
import { NationalIdentityNumberDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputNationalIdentityNumber = ({
  component,
  submissionPath,
}: InputComponentProps<NationalIdentityNumberDefinition>) => (
  <FormGroup>
    <TextField
      statePath={resolveSubmissionPath(component, submissionPath)}
      label={component.label ?? TEXTS.statiske.identity.identityNumber}
      description={component.description}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      inputMode="numeric"
      formatKey="identityNumber"
    />
  </FormGroup>
);

export default InputNationalIdentityNumber;
