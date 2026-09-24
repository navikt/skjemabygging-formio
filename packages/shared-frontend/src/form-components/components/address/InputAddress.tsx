import Address from '../../../components/address/Address';
import { getPrefilledAddress } from '../../../components/address/addressUtils';
import { useLanguage } from '../../../context/language/LanguageContext';
import { AddressDefinition } from '../../component-types';
import { InputComponentProps, isRequired, resolveFieldSize, resolveSubmissionPath } from '../../inputComponentUtils';

const InputAddress = ({ component, submissionPath }: InputComponentProps<AddressDefinition>) => {
  const { currentLanguage } = useLanguage();
  const isPrefilled = getPrefilledAddress(component, currentLanguage) !== undefined;

  return (
    <Address
      statePath={resolveSubmissionPath(component, submissionPath)}
      addressType={component.addressType}
      addressTypeWizard={component.addressTypeWizard}
      prefillKey={component.prefillKey}
      customLabels={component.customLabels}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly || isPrefilled}
    />
  );
};

export default InputAddress;
