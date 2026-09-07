import OrganizationNumber from '../../../components/organization-number/OrganizationNumber';
import { OrganizationNumberDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputOrganizationNumber = ({ component, submissionPath }: InputComponentProps<OrganizationNumberDefinition>) => {
  const validation = useResolvedValidation(component);

  return (
    <FormGroup>
      <OrganizationNumber
        statePath={resolveSubmissionPath(component, submissionPath)}
        label={component.label}
        description={component.description}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        autoComplete={component.autocomplete}
        readMore={resolveReadMore(component)}
        validation={validation}
      />
    </FormGroup>
  );
};

export default InputOrganizationNumber;
