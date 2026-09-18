import { Box, Button, Heading } from '@navikt/ds-react';
import { submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import TranslatedDescription from '../../../components/shared/TranslatedDescription';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../../context/form-definition/FormDefinitionContext';
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
import RenderInputForm from '../../RenderInputForm';
import {
  addDataGridRowId,
  getActiveRowComponents,
  getRenderedDataGridRows,
  removeDataGridRowId,
  syncDataGridRowIds,
} from './dataGridRows';
import styles from './InputDataGrid.module.css';

interface InputDataGridProps {
  component: DataGridDefinition;
  componentRegistry?: InputComponentRegistry;
}

const InputDataGrid = ({ component, componentRegistry }: InputDataGridProps) => {
  const { translate } = useLanguage();
  const { submission, updateSubmission } = useSubmissionState();
  const form = useFormDefinitionForm();
  const submissionMethod = useFormDefinitionSubmissionMethod();
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
    <>
      <div className={styles.rows}>
        {renderedRows.map((row, index) => {
          const rowComponents = getActiveRowComponents(
            rowComponentTemplates[index] ?? [],
            row,
            submission?.data,
            form,
            submissionMethod,
          );

          return (
            <div key={synchronizedRowIds[index]} className={styles.row}>
              <div className={styles.rowHeader}>
                <Heading level="3" size="small" className="aksel-fieldset__legend-formio-template">
                  {translate(rowTitle || label || component.key)} {index + 1}
                </Heading>
                {!disableAddingRemovingRows && (
                  <Button type="button" variant="secondary" size="small" onClick={() => removeRow(index)}>
                    {translate(removeAnother || 'Fjern')}
                  </Button>
                )}
              </div>
              <RenderInputForm components={rowComponents} componentRegistry={componentRegistry} />
            </div>
          );
        })}
      </div>

      {!disableAddingRemovingRows && (
        <Box marginBlock="space-16 space-0">
          <Button type="button" variant="secondary" onClick={addRow}>
            {translate(addAnother || 'Legg til')}
          </Button>
        </Box>
      )}
    </>
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
