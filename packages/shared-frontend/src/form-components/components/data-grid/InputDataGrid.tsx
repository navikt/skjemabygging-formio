import { Box } from '@navikt/ds-react';
import { submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import Fieldset from '../../../components/fieldset/Fieldset';
import { getRenderedDataGridRows } from '../../../context/form-definition/dataGridRows';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
} from '../../../context/form-definition/formDefinitionUtils';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidationActions } from '../../../context/validation/ValidationContext';
import { useValidationScope } from '../../../context/validation/ValidationScopeContext';
import { DataGridDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import { addDataGridRowId, removeDataGridRowId, syncDataGridRowIds } from './dataGridRows';
import InputDataGridRows from './InputDataGridRows';

interface InputDataGridProps {
  component: DataGridDefinition;
  componentRegistry?: InputComponentRegistry;
}

const InputDataGrid = ({ component, componentRegistry }: InputDataGridProps) => {
  const { submission, updateSubmission } = useSubmissionState();
  const { schedulePageValidation } = useValidationActions();
  const { pageKey } = useValidationScope();
  const { components, label, description, hideLabel, addAnother, removeAnother, disableAddingRemovingRows, rowTitle } =
    component;
  const submissionPath = getResolvedSubmissionPath(component);
  const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
  const dataGridRows = Array.isArray(rows) ? rows : [];
  const renderedRows = getRenderedDataGridRows(dataGridRows, component.initEmpty);
  const [rowIds, setRowIds] = useState(() => syncDataGridRowIds([], renderedRows.length));
  const synchronizedRowIds = syncDataGridRowIds(rowIds, renderedRows.length);
  const rowComponentTemplates = renderedRows.map((_, index) =>
    toComponentDefinitions(enrichComponentsWithBaseSubmissionPath(components, `${submissionPath}[${index}]`)),
  );

  const updateRows = (nextRows: object[]) => {
    updateSubmission(submissionPath, nextRows);
    schedulePageValidation(pageKey);
  };

  const addRow = () => {
    setRowIds(addDataGridRowId(synchronizedRowIds));
    updateRows([...dataGridRows, ...(dataGridRows.length === 0 && renderedRows.length > 0 ? [{}] : []), {}]);
  };
  const removeRow = (index: number) => {
    setRowIds(removeDataGridRowId(synchronizedRowIds, index));
    updateRows(dataGridRows.filter((_, rowIndex) => rowIndex !== index));
  };

  if (!components?.length) {
    return null;
  }

  const content = (
    <InputDataGridRows
      addLabel={addAnother}
      componentRegistry={componentRegistry}
      onAdd={addRow}
      onRemove={removeRow}
      removable={!disableAddingRemovingRows}
      removeLabel={removeAnother}
      rowComponents={rowComponentTemplates}
      rowIds={synchronizedRowIds}
      rowLabel={rowTitle || label || component.key}
      rows={renderedRows}
    />
  );

  return (
    <Box marginBlock="space-0 space-40" data-cy="input-datagrid">
      {label || description ? (
        <Fieldset
          legend={label || component.key}
          hideLegend={hideLabel || !label}
          description={description}
          inset={false}
          marginBottom="space-0"
        >
          {content}
        </Fieldset>
      ) : (
        content
      )}
    </Box>
  );
};

export default InputDataGrid;
