import NationalIdentityNumber from '../../../components/national-identity-number/NationalIdentityNumber';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';

const InputNationalIdentityNumber = ({ component, submissionPath }: InputComponentProps) => (
  <NationalIdentityNumber
    statePath={resolveSubmissionPath(component, submissionPath)}
    label={component.label}
    description={component.description}
    required={isRequired(component)}
    readOnly={component.readOnly}
    readMore={resolveReadMore(component)}
  />
);

export default InputNationalIdentityNumber;
