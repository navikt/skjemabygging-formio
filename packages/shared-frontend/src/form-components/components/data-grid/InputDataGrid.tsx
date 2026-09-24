import { Box } from '@navikt/ds-react';
import { submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import TranslatedDescription from '../../../components/shared/TranslatedDescription';
import { getRenderedDataGridRows } from '../../../context/form-definition/dataGridRows';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
} from '../../../context/form-definition/formDefinitionUtils';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidationActions } from '../../../context/validation/ValidationContext';
import { useValidationScope } from '../../../context/validation/ValidationScopeContext';
import { DataGridDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import { addDataGridRowId, removeDataGridRowId, syncDataGridRowIds } from './dataGridRows';
import styles from './InputDataGrid.module.css';
import InputDataGridRows from './InputDataGridRows';

interface InputDataGridProps {
  component: DataGridDefinition;
  componentRegistry?: InputComponentRegistry;
}

const InputDataGrid = ({ component, componentRegistry }: InputDataGridProps) => {
  const { translate } = useLanguage();
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
        <fieldset className={styles.fieldset}>
          {!hideLabel && label && (
            <legend className="aksel-fieldset__legend-formio-template">{translate(label)}</legend>
          )}
          {description && (
            <div className={`description ${styles.description}`}>
              <TranslatedDescription translationKey={description} />
            </div>
          )}
          <div className={`aksel-fieldset__content ${styles.content}`}>{content}</div>
        </fieldset>
      ) : (
        content
      )}
    </Box>
  );
};

export default InputDataGrid;
