import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import NationalIdentityNumber from '../../../components/national-identity-number/NationalIdentityNumber';
import { NationalIdentityNumberDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
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
}: InputComponentProps<NationalIdentityNumberDefinition>) => {
  const validation = useResolvedValidation(component);
  return (
    <FormGroup>
      <NationalIdentityNumber
        statePath={resolveSubmissionPath(component, submissionPath)}
        label={component.label ?? TEXTS.statiske.identity.identityNumber}
        description={component.description}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
        validation={validation}
      />
    </FormGroup>
  );
};

export default InputNationalIdentityNumber;
