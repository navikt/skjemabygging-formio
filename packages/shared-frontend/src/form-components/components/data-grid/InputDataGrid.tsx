import { Box, Button, Heading } from '@navikt/ds-react';
import {
  checkCondition,
  Component,
  Form,
  SubmissionData,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import TranslatedDescription from '../../../components/shared/TranslatedDescription';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from '../../../context/form-definition/formDefinitionUtils';
import { useLanguage } from '../../../context/language/LanguageContext';
import { createUpdatedSubmission, useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidation } from '../../../context/validation/ValidationContext';
import { useValidationScope } from '../../../context/validation/ValidationScopeContext';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';
import FormGroup from '../../shared/FormGroup';
import { addDataGridRowId, getRenderedDataGridRows, removeDataGridRowId, syncDataGridRowIds } from './dataGridRows';
import styles from './InputDataGrid.module.css';

interface InputDataGridProps {
  component: Component;
  componentRegistry?: InputComponentRegistry;
}

const InputDataGrid = ({ component, componentRegistry }: InputDataGridProps) => {
  const { translate } = useLanguage();
  const { submission, updateSubmission } = useSubmissionState();
  const { form } = useFormDefinition();
  const { handleFieldChange } = useValidation();
  const { pageKey, components: pageComponents } = useValidationScope();
  const { components, label, description, hideLabel, addAnother, removeAnother, disableAddingRemovingRows, rowTitle } =
    component;
  const submissionPath = getResolvedSubmissionPath(component);
  const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
  const dataGridRows = Array.isArray(rows) ? rows : [];
  const renderedRows = getRenderedDataGridRows(dataGridRows, component.initEmpty);
  const [rowIds, setRowIds] = useState(() => syncDataGridRowIds([], renderedRows.length));
  const synchronizedRowIds = syncDataGridRowIds(rowIds, renderedRows.length);
  const rowComponentTemplates = useMemo(
    () =>
      renderedRows.map((_, index) => enrichComponentsWithBaseSubmissionPath(components, `${submissionPath}[${index}]`)),
    [components, renderedRows.length, submissionPath],
  );

  const updateRows = (nextRows: object[]) => {
    const nextSubmission = createUpdatedSubmission(submission, submissionPath, nextRows);
    updateSubmission(submissionPath, nextRows);
    handleFieldChange(pageKey, pageComponents, nextSubmission);
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
          const rowComponents = getActiveRowComponents(rowComponentTemplates[index] ?? [], row, submission?.data, form);

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
    <FormGroup>
      <Box marginBlock="space-0 space-40" data-cy="input-datagrid">
        {label || description ? (
          <fieldset className={styles.fieldset}>
            {!hideLabel && label && (
              <legend className="aksel-fieldset__legend-formio-template">{translate(label)}</legend>
            )}
            {description && (
              <div className={`description ${styles.description}`}>
                <TranslatedDescription>{description}</TranslatedDescription>
              </div>
            )}
            <div className={`aksel-fieldset__content ${styles.content}`}>{content}</div>
          </fieldset>
        ) : (
          content
        )}
      </Box>
    </FormGroup>
  );
};

const getActiveRowComponents = (
  components: Component[],
  row: object | undefined,
  data: SubmissionData | undefined,
  form: Form,
) =>
  components
    .filter((component) => checkCondition(component, row, data, form))
    .map((component) =>
      component.components?.length
        ? {
            ...component,
            components: getActiveRowComponents(component.components, getChildRow(component, row), data, form),
          }
        : component,
    );

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const shouldScopeChildRow = (component: Component) => Boolean(component.key && (component.tree || component.input));

const getChildRow = (component: Component, row: object | undefined) => {
  if (!shouldScopeChildRow(component) || !isObjectRecord(row)) {
    return row;
  }

  const childRow = row[component.key];
  return isObjectRecord(childRow) ? childRow : row;
};

export default InputDataGrid;
export { getActiveRowComponents, getRenderedDataGridRows };
