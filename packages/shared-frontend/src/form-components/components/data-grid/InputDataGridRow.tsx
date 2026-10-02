import DataGridRow from '../../../components/data-grid/DataGridRow';
import { getActiveRowComponents } from '../../../context/form-definition/dataGridRows';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { ComponentDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';

interface InputDataGridRowProps {
  componentRegistry?: InputComponentRegistry;
  components: ComponentDefinition[];
  index: number;
  label: string;
  onRemove: () => void;
  removeLabel?: string;
  removable: boolean;
  row: object;
}

const InputDataGridRow = ({
  componentRegistry,
  components,
  index,
  label,
  onRemove,
  removeLabel,
  removable,
  row,
}: InputDataGridRowProps) => {
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const form = useFormDefinitionForm();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const rowComponents = getActiveRowComponents(components, row, submission?.data, form, submissionMethod, submission);

  return (
    <DataGridRow
      title={`${translate(label)} ${index + 1}`}
      onRemove={removable ? onRemove : undefined}
      removeLabel={removeLabel}
    >
      <RenderInputForm components={rowComponents} componentRegistry={componentRegistry} />
    </DataGridRow>
  );
};

export default InputDataGridRow;
