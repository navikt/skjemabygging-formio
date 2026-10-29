import { NavUnitLookupFeedback } from '../../../components/nav-unit-select/NavUnitLookupFeedback';
import NavUnitSelect from '../../../components/nav-unit-select/NavUnitSelect';
import { useNavUnits } from '../../../components/nav-unit-select/useNavUnits';
import { NavUnitSelectDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';

const InputNavUnitSelect = ({ component, submissionPath }: InputComponentProps<NavUnitSelectDefinition>) => {
  const { availableUnits, error, retry } = useNavUnits({ unitTypes: component.unitTypes });
  return (
    <>
      <NavUnitSelect
        statePath={resolveSubmissionPath(component, submissionPath)}
        units={availableUnits ?? []}
        label={component.label}
        description={component.description}
        required={isRequired(component)}
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
        fieldSize={resolveFieldSize(component)}
      />
      {error && <NavUnitLookupFeedback retry={retry} />}
    </>
  );
};

export default InputNavUnitSelect;
