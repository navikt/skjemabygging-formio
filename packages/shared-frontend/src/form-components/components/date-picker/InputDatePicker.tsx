import DatePicker from '../../../components/date/DatePicker';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidationScope } from '../../../context/validation/ValidationScopeContext';
import { DatePickerDefinition } from '../../component-types';
import { getDatePickerFromDate, getDatePickerToDate } from '../../dateDefinitionUtils';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputDatePicker = ({ component, submissionPath }: InputComponentProps<DatePickerDefinition>) => {
  const { submission } = useSubmissionState();
  const { components: pageComponents } = useValidationScope();
  const statePath = resolveSubmissionPath(component, submissionPath);

  return (
    <FormGroup>
      <DatePicker
        statePath={statePath}
        label={component.label}
        description={component.description}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        readOnly={component.readOnly}
        fromDate={getDatePickerFromDate(component, pageComponents, submission)}
        toDate={getDatePickerToDate(component)}
        readMore={resolveReadMore(component)}
      />
    </FormGroup>
  );
};

export default InputDatePicker;
